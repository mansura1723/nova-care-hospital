import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { detectUrgentSymptoms, generateReferenceNumber, sanitizeText } from './src/utils/hospitalLogic';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));

// Simple sliding-window rate limiter per IP for /api routes
const rateBuckets = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 40;

function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const history = (rateBuckets.get(key) || []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (history.length >= RATE_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests. Please wait a minute before sending another request.',
    });
    return;
  }
  history.push(now);
  rateBuckets.set(key, history);
  next();
}

app.use('/api', apiRateLimit);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'nova-care-hospital' });
});

app.post('/api/booking-reference', (req: Request, res: Response) => {
  const prefix = typeof req.body?.prefix === 'string' ? req.body.prefix.replace(/[^A-Z]/g, '').slice(0, 5) : 'NCH';
  res.json({
    referenceNumber: generateReferenceNumber(prefix || 'NCH'),
    generatedAt: new Date().toISOString(),
  });
});

const BROCHURES: Record<string, { title: string; filename: string; body: string }> = {
  'patient-guide': {
    title: 'Nova Care Hospital — Patient & Visitor Guide',
    filename: 'NovaCare_Patient_Visitor_Guide.txt',
    body: [
      'NOVA CARE HOSPITAL — PATIENT & VISITOR GUIDE',
      '=============================================',
      '',
      '1. ADMISSION PROCESS',
      '- Bring government photo ID, prior medical summaries, and referral notes (if applicable).',
      '- Coordinate room category and billing deposit or insurance pre-authorization at Admissions.',
      '',
      '2. VISITING HOURS',
      '- General Wards: 11:00 AM - 1:00 PM and 5:00 PM - 7:30 PM',
      '- ICU / NICU: Restricted quiet hours; maximum 2 visitors per bedside.',
      '',
      '3. HOSPITAL AMENITIES',
      '- 24/7 Inpatient Pharmacy · Basement Parking · Courtyard Cafe · Prayer & Quiet Room',
      '- International Patient Desk for medical visa guidance and interpreter coordination.',
      '',
      '4. IMPORTANT NOTICE',
      'This brochure provides general hospital visitor information and is not a clinical directive.',
    ].join('\n'),
  },
  'health-packages': {
    title: 'Nova Care Hospital — Preventive Health Packages',
    filename: 'NovaCare_Health_Packages.txt',
    body: [
      'NOVA CARE HOSPITAL — PREVENTIVE HEALTH CHECKUP SUMMARY',
      '======================================================',
      '',
      '- General Health Check (BDT 4,800): CBC, Fasting Glucose, Lipid, Creatinine, SGPT, Urine.',
      '- Cardiac Check (BDT 11,200): hs-CRP, Lipid, HbA1c, ECG, 2D Echo, Stress Test, Cardiologist.',
      '- Executive Health Check (BDT 14,500): Complete metabolic, thyroid, ECG, Echo, Ultrasound, X-Ray.',
      '- Signature Full Body Checkup (BDT 18,500): 65+ lab markers, Cardiac, Spirometry, Imaging.',
      '',
      'Preparation: 8-12 hours overnight water-only fasting for morning metabolic panels.',
    ].join('\n'),
  },
  'cardiology-services': {
    title: 'Nova Care Hospital — Cardiac Care Overview',
    filename: 'NovaCare_Cardiology_Overview.txt',
    body: [
      'NOVA CARE HOSPITAL — CARDIOLOGY & VASCULAR CENTRE',
      '=================================================',
      '',
      'Services: Non-invasive echocardiography, ECG, Treadmill Stress Testing, Holter Monitoring,',
      'hypertension optimization, and interventional cardiology evaluation.',
      '',
      'Emergency Warning: For sudden chest pressure, shortness of breath, or arm/jaw pain,',
      'seek immediate emergency medical care rather than waiting for a scheduled clinic visit.',
    ].join('\n'),
  },
  'emergency-preparedness': {
    title: 'Nova Care Hospital — Emergency Readiness Guide',
    filename: 'NovaCare_Emergency_Guide.txt',
    body: [
      'NOVA CARE HOSPITAL — EMERGENCY PREPAREDNESS NOTICE',
      '===========================================================',
      '',
      'Recognize Urgent Warning Signs (FAST & Acute Care):',
      '- Sudden chest tightness or breathing difficulty',
      '- Face drooping, arm weakness, or slurred speech',
      '- Uncontrolled bleeding, severe trauma, or loss of consciousness',
      '',
      'Notice: This platform is not a substitute for emergency medical care.',
      'Seek immediate emergency attention at the nearest hospital Emergency Department.',
    ].join('\n'),
  },
};

app.get('/api/brochure/:slug', (req: Request, res: Response) => {
  const slug = String(req.params.slug || '').replace(/[^a-z0-9-]/g, '');
  const brochure = BROCHURES[slug];
  if (!brochure) {
    res.status(404).json({ error: 'Brochure not found.' });
    return;
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${brochure.filename}"`);
  res.send(brochure.body);
});

const ASSISTANT_FAQ_FALLBACK = (message: string, language: string): string => {
  const q = message.toLowerCase();
  const isBn = language === 'bn';
  if (q.includes('cardio') || q.includes('heart') || q.includes('হৃদ')) {
    return isBn
      ? 'আমাদের কার্ডিওলজি বিভাগে ইসিজি, ইকোকার্ডিওগ্রাফি এবং বিশেষজ্ঞ পরামর্শের সুবিধা রয়েছে। "Find a Doctor" বা "Specialities > Cardiology" থেকে সময়সূচী দেখতে পারেন। এই তথ্য শুধুমাত্র সাধারণ নির্দেশনার জন্য।'
      : 'Our Cardiology department covers non-invasive cardiac imaging (ECG, 2D Echo, Stress Testing) and specialist consultations such as Dr. Priya Sharma. You can browse /specialities/cardiology or request an appointment online. Informational guidance only.';
  }
  if (q.includes('package') || q.includes('checkup') || q.includes('প্যাকেজ')) {
    return isBn
      ? 'নোভা কেয়ারে ১০টি প্রিভেন্টিভ হেলথ চেকআপ প্যাকেজ রয়েছে—যেমন জেনারেল হেলথ চেক, কার্ডিয়াক চেক, এবং এক্সিকিউটিভ হেলথ চেক। বিস্তারিত ও মূল্য দেখতে Health Packages পেজ ভিজিট করুন।'
      : 'Nova Care offers 10 preventive health packages including General Health Check, Cardiac Check, Executive Health Check, Women’s & Men’s Wellness, Diabetes Screening, and Full Body Checkup. Visit /health-packages to compare included tests and preparation guidelines. Informational guidance only.';
  }
  if (q.includes('appointment') || q.includes('book') || q.includes('অ্যাপয়েন্টমেন্ট')) {
    return isBn
      ? 'অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠাতে "Book Appointment" বাটনে ক্লিক করে বিভাগ, ডাক্তার, তারিখ ও সময় নির্বাচন করুন। সাবমিট করার পর আপনি একটি রেফারেন্স নম্বর পাবেন।'
      : 'To request an appointment, open the Book Appointment page, choose a medical department and specialist, pick an available future date and time slot, and submit the form to receive a reference number.';
  }
  return isBn
    ? 'আমি নোভা কেয়ার হাসপাতালের বিভাগ, ডাক্তার, হেলথ প্যাকেজ, ডায়াগনস্টিক সেবা এবং অ্যাপয়েন্টমেন্ট প্রক্রিয়া সম্পর্কে তথ্য দিতে পারি। আমি কোনো রোগ নির্ণয় বা ওষুধের পরামর্শ দিই না।'
    : 'I can help you explore Nova Care Hospital’s 30 medical departments, find specialists, compare health checkup packages, review diagnostic test preparation, and navigate appointment requests. Please note that all responses are informational only and do not replace a licensed physician.';
};

app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  const rawMessage = typeof req.body?.message === 'string' ? req.body.message : '';
  const language = req.body?.language === 'bn' ? 'bn' : 'en';
  const message = sanitizeText(rawMessage, 1000);

  if (!message) {
    res.status(400).json({ error: 'Please enter a question for the hospital guide assistant.' });
    return;
  }

  const urgent = detectUrgentSymptoms(message);
  if (urgent) {
    const emergencyReply =
      language === 'bn'
        ? 'সতর্কতা: আপনার বর্ণিত লক্ষণগুলো জরুরি চিকিৎসার ইঙ্গিত দিতে পারে। অনুগ্রহ করে এই চ্যাটের ওপর নির্ভর না করে অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান অথবা স্থানীয় জরুরি সেবায় কল করুন। নোভা কেয়ারের জরুরি তথ্য পেজ দেখতে /emergency ভিজিট করুন।'
        : 'URGENT SAFETY NOTICE: The symptoms you mentioned (such as chest pain, breathing difficulty, stroke signs, or severe distress) may require immediate emergency medical attention. Do not wait for an online consultation or rely on this assistant—please go to the nearest hospital Emergency Department or contact local emergency services immediately. You can also view our 24/7 Emergency Services guide at /emergency.';
    res.json({
      reply: emergencyReply,
      urgent: true,
      fallback: false,
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.json({
      reply: ASSISTANT_FAQ_FALLBACK(message, language),
      urgent: false,
      fallback: true,
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: message,
      config: {
        systemInstruction: [
          'You are the Nova Care Hospital Digital Guide Assistant.',
          `Respond concisely and empathetically in ${language === 'bn' ? 'Bangla (Bengali)' : 'English'}.`,
          'You help visitors understand the hospital’s 30 medical departments (Cardiology, Neurology, Oncology, Orthopaedics, Paediatrics, Gastroenterology, Gynaecology, etc.), specialists, preventive health packages, diagnostic preparation, visitor guide, and online appointment request steps.',
          'STRICT SAFETY RULES:',
          '1. NEVER diagnose any disease or interpret personal medical symptoms as a diagnosis.',
          '2. NEVER prescribe or recommend specific medications or dosages.',
          '3. NEVER claim to replace a licensed physician.',
          '4. ALWAYS keep answers informational and remind the user when appropriate to consult a qualified clinician.',
          '5. Do not fabricate phone numbers or real medical accreditations.',
        ].join(' '),
      },
    });

    const text = (response.text || '').trim();
    if (!text) {
      res.json({
        reply: ASSISTANT_FAQ_FALLBACK(message, language),
        urgent: false,
        fallback: true,
      });
      return;
    }

    res.json({
      reply: text,
      urgent: false,
      fallback: false,
    });
  } catch (err) {
    console.error('Gemini Assistant fallback triggered:', err instanceof Error ? err.message : 'Error');
    res.json({
      reply: ASSISTANT_FAQ_FALLBACK(message, language),
      urgent: false,
      fallback: true,
    });
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build missing. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova Care Hospital server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
