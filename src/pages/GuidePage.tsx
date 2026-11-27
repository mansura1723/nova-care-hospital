import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HOSPITAL_IMAGES } from '../data/seedData';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const GuidePage: React.FC = () => {
  const { faqs } = useApp();
  const [faqQuery, setFaqQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      !faqQuery.trim() ||
      f.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqQuery.toLowerCase())
  );

  const sections = [
    {
      title: 'Admission Process',
      content:
        'Present your government photo ID, specialist admission advice, and previous medical summaries at the Ground Floor Admissions Desk. Rooms and billing preferences are confirmed prior to ward escort.',
    },
    {
      title: 'Discharge Process',
      content:
        'Upon clinician clearance, the ward team prepares a structured discharge summary, medication schedule, and follow-up date while the billing desk finalizes your itemized statement.',
    },
    {
      title: 'Visiting Hours & Visitor Guidelines',
      content:
        'General wards welcome visitors between 11:00 AM – 1:00 PM and 5:00 PM – 7:30 PM. Up to two visitors may enter ICU/NICU during scheduled quiet windows. Visitors with fever or respiratory symptoms are kindly asked to postpone visits.',
    },
    {
      title: 'Patient Rights & Privacy',
      content:
        'Every patient has the right to respectful care, clear explanations of proposed procedures, informed consent, second opinions, and strict confidentiality of medical records.',
    },
    {
      title: 'Insurance & Payment Information',
      content:
        'We accept major debit/credit cards, mobile financial wallets, bank transfers, and pre-authorized corporate or international medical insurance letters of guarantee.',
    },
    {
      title: 'Parking, Cafeteria & Pharmacy',
      content:
        'Basement visitor parking includes dedicated wheelchair access ramps. A 24/7 hospital pharmacy operates near the Main Atrium alongside a nutritious courtyard cafeteria and quiet prayer room.',
    },
    {
      title: 'Accommodation & International Patient Support',
      content:
        'Our International Patient Desk assists visiting families with medical invitation letters, airport coordination, interpreter scheduling, and nearby partner guest-house recommendations.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageMeta
        title="Patient & Visitor Guide"
        description="Complete admission, discharge, visiting hours, insurance, parking, pharmacy, international patient support, virtual tour, and downloadable brochures."
      />
      <Breadcrumb items={[{ label: 'Patient & Visitor Guide' }]} />

      <div className="space-y-2 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Patient & Visitor Guide
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Everything patients and visiting families need for admissions, visiting hours, amenities, insurance coordination, and campus orientation.
        </p>
      </div>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {sec.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {sec.content}
            </p>
          </section>
        ))}
      </div>

      {/* Virtual Hospital Tour Gallery */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Virtual Hospital Campus Tour Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { src: HOSPITAL_IMAGES.heroCampus, label: 'Main Campus Exterior' },
            { src: HOSPITAL_IMAGES.atriumLobby, label: 'Atrium & Reception Desk' },
            { src: HOSPITAL_IMAGES.diagnosticMri, label: '3T MRI Diagnostic Wing' },
            { src: HOSPITAL_IMAGES.healthCheckup, label: 'Preventive Consultation Suite' },
          ].map((item) => (
            <figure
              key={item.label}
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="aspect-[4/3]">
                <img
                  src={item.src}
                  alt={item.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Downloadable Brochures & Searchable FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Downloadable Hospital Brochures
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Save printable reference summaries for admissions, preventive packages, and cardiac care.
          </p>
          <div className="space-y-2.5">
            {[
              { slug: 'patient-guide', label: 'Patient & Visitor Handbook' },
              { slug: 'health-packages', label: 'Preventive Health Packages Guide' },
              { slug: 'cardiology-services', label: 'Cardiology & Vascular Overview' },
              { slug: 'emergency-preparedness', label: 'Emergency Readiness Notice' },
            ].map((b) => (
              <a
                key={b.slug}
                href={`/api/brochure/${b.slug}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <span>{b.label}</span>
                <Download className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Filter FAQs..."
              aria-label="Filter frequently asked questions"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <details
                key={faq.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
              >
                <summary className="cursor-pointer font-medium text-sm text-slate-900 dark:text-white">
                  {faq.question}
                </summary>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
