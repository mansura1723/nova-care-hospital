import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { HOSPITAL_IMAGES } from '../data/seedData';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      <PageMeta
        title="About Us"
        description="Learn about Nova Care Hospital’s mission, core values, leadership team, infrastructure, medical technology, and quality safety culture."
      />
      <Breadcrumb items={[{ label: 'About Us' }]} />

      {/* Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            Institutional Overview
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Built for clinical rigor, clear communication, and patient dignity.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Nova Care Hospital is designed as an international multi-specialty healthcare campus uniting 30 clinical departments, precision imaging, laboratory medicine, and coordinated digital care tools.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leadership profiles, campus milestones, and quality benchmarks below provide an institutional overview of Nova Care Hospital.
          </p>
        </div>
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10]">
          <img
            src={HOSPITAL_IMAGES.atriumLobby}
            alt="Nova Care Hospital modern sunlit lobby"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Mission, Vision, Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Deliver accessible, evidence-led tertiary healthcare with transparent diagnostics, safety-first protocols, and respectful guidance for every patient and family.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Vision</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Set a regional benchmark for integrated preventive medicine, rapid acute care pathways, and secure digital health access.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Core Values</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Clinical Integrity · Patient Privacy · Multidisciplinary Teamwork · Continuous Safety Learning · Compassionate Clarity.
          </p>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Hospital Leadership Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dr. Priya Sharma',
              role: 'Chief of Clinical Cardiology & Medical Board Chair',
              photo: HOSPITAL_IMAGES.doctorFemale,
              dept: 'Cardiology',
            },
            {
              name: 'Dr. David Chen',
              role: 'Director of Neurosciences & Acute Stroke Quality',
              photo: HOSPITAL_IMAGES.doctorMale,
              dept: 'Neurology',
            },
            {
              name: 'Samira Chowdhury',
              role: 'Chief Hospital Operations & Patient Experience Officer',
              photo: '',
              dept: 'Administration',
            },
          ].map((leader) => (
            <div
              key={leader.name}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-4"
            >
              <DoctorAvatar
                name={leader.name}
                photoUrl={leader.photo}
                departmentName={leader.dept}
              />
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {leader.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{leader.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* History, Infrastructure, Technology, Quality */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Hospital History & Milestones
          </h2>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li><span className="font-semibold text-slate-900 dark:text-white tabular-nums">2018:</span> Campus planning and outpatient clinical model initiated.</li>
            <li><span className="font-semibold text-slate-900 dark:text-white tabular-nums">2021:</span> Diagnostic imaging wing and automated pathology labs commissioned.</li>
            <li><span className="font-semibold text-slate-900 dark:text-white tabular-nums">2024:</span> Expanded to 30 multidisciplinary departments with dedicated ICU and NICU units.</li>
            <li><span className="font-semibold text-slate-900 dark:text-white tabular-nums">2026:</span> Bilingual smart patient portal and digital appointment coordination launched.</li>
          </ol>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Infrastructure & Medical Technology
          </h2>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
            <li>Wide-bore 3T MRI, multi-slice CT angiography, and digital PACS imaging review.</li>
            <li>Modular positive-pressure surgical suites and HEPA-filtered ICU bays.</li>
            <li>Barcode-verified automated clinical biochemistry and hematology processing.</li>
            <li>Dedicated outpatient preventive health checkup lounge and 24/7 inpatient pharmacy.</li>
          </ul>
        </div>
      </section>

      {/* Quality, Accreditation & Corporate Info */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
              Quality & Patient Safety
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured surgical safety checklists, medication double-verification, infection control rounds, and transparent clinical incident learning.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
              Accreditation & Quality Benchmarks
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Quality benchmarks, clinical safety audits, and recognition details are published here as third-party certifications are completed.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
              Corporate Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nova Care Healthcare Holdings · Governance Charter · Clinical Ethics Committee · Patient Privacy Office.
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
          <Link
            to="/doctors"
            className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold"
          >
            Meet Our Specialists
          </Link>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
          >
            Contact Corporate Desk
          </Link>
        </div>
      </section>
    </div>
  );
};
