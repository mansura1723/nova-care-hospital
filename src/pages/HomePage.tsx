import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HOSPITAL_IMAGES } from '../data/seedData';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { HumanBodyFinder } from '../components/HumanBodyFinder';
import { PageMeta } from '../components/PageMeta';

export const HomePage: React.FC = () => {
  const { t, doctors, departments, packages, diagnostics, articles, faqs, settings } = useApp();
  const [faqQuery, setFaqQuery] = useState('');

  const featuredDoctors = doctors.filter((d) => d.isFeatured).slice(0, 6);
  const featuredDepts = departments.slice(0, 8);
  const featuredPackages = packages.filter((p) => p.isPublished).slice(0, 4);
  const featuredDiagnostics = diagnostics.slice(0, 6);
  const latestArticles = articles.filter((a) => a.isPublished).slice(0, 3);

  const filteredFaqs = faqs.filter(
    (f) =>
      !faqQuery.trim() ||
      f.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqQuery.toLowerCase())
  );

  return (
    <div>
      <PageMeta
        title="Home"
        description="Nova Care Hospital — International multi-specialty smart healthcare platform with 30 departments, specialist directory, diagnostics, and patient portal."
      />

      {/* Hero Split Banner */}
      <section className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
                {t.heroTag}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F2942] dark:text-white leading-[1.12]">
                {t.heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/appointments/book"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#173d61] dark:hover:bg-teal-500 transition-colors whitespace-nowrap"
                >
                  <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                  {t.bookAppointment}
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  {t.findDoctor}
                </Link>
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors whitespace-nowrap"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  {t.emergencyCta}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[260px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img
                  src={HOSPITAL_IMAGES.heroCampus}
                  alt="Nova Care Hospital international medical campus exterior at dusk"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Hospital Highlights Strip (Full-Width Row Below Hero Split) */}
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#0F2942] dark:text-white tabular-nums">
                {departments.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Clinical & Surgical Departments
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#0F2942] dark:text-white tabular-nums">
                24/7
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Emergency Triage & Critical Care
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#0F2942] dark:text-white tabular-nums">
                {packages.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Preventive Screening Packages
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#0F2942] dark:text-white tabular-nums">
                3T MRI
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Diagnostic & Automated Labs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Specialities & Interactive Body Department Finder */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.specialitiesTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                {t.specialitiesSubtitle}
              </p>
            </div>
            <Link
              to="/specialities"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
            >
              {t.viewAll} ({departments.length})
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <HumanBodyFinder />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredDepts.map((dept) => (
              <Link
                key={dept.id}
                to={`/specialities/${dept.slug}`}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-teal-600 dark:hover:border-teal-500 transition-colors"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{dept.category}</p>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {dept.overview}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.featuredDoctorsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                {t.featuredDoctorsSubtitle}
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
            >
              {t.viewAll} ({doctors.length})
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <article
                key={doc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <DoctorAvatar
                    name={doc.name}
                    photoUrl={doc.photoUrl}
                    departmentName={doc.departmentName}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      {doc.departmentName} · <span className="tabular-nums">{doc.experienceYears} yrs exp.</span>
                    </p>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                      <Link to={`/doctors/${doc.slug}`} className="hover:underline">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {doc.designation}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {doc.qualifications}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    to={`/doctors/${doc.slug}`}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/appointments/book?doctor=${doc.id}&department=${doc.departmentId}`}
                    className="px-3.5 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium hover:bg-[#163b5e] dark:hover:bg-teal-500 whitespace-nowrap"
                  >
                    Request Appointment
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Health Packages & Diagnostic Services */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Health Packages */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {t.packagesTitle}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                  {t.packagesSubtitle}
                </p>
              </div>
              <Link
                to="/health-packages"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
              >
                Explore All {packages.length} Packages
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPackages.map((pkg) => (
                <article
                  key={pkg.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {pkg.category} · <span className="tabular-nums">{pkg.includedTests.length} parameters</span>
                      </p>
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500">Package Price</p>
                      <p className="font-display font-bold text-slate-900 dark:text-white tabular-nums">
                        BDT {pkg.priceDemo.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      to={`/health-packages/${pkg.slug}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Diagnostics & Facilities Bento Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={HOSPITAL_IMAGES.diagnosticMri}
                  alt="Nova Care 3T MRI diagnostic imaging suite"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.diagnosticsTitle}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {t.diagnosticsSubtitle}
                  </p>
                </div>
                <Link
                  to="/diagnostics"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  View Preparation Guides & Services
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredDiagnostics.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                      {service.category} · {service.turnaroundTime}
                    </p>
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white mt-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                    Estimated Fee: BDT {service.priceDemo.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us + Facilities & Patient Stories */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.whyChooseTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed around calm architectural spaces, multidisciplinary consultation pathways,
                and privacy-first digital patient records.
              </p>
              <ol className="space-y-4 text-sm">
                <li className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    01. Multidisciplinary Clinical Coordination
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Specialists across Cardiology, Neurology, Oncology, and Critical Care collaborate on unified care plans.
                  </p>
                </li>
                <li className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    02. Protected Patient Portal & Online Reports
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Verified Google authentication isolates patient appointments and diagnostic report access per user.
                  </p>
                </li>
                <li className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    03. Bilingual Visitor & Patient Support
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Instant English & Bangla navigation, accessibility scaling, and transparent admission guidance.
                  </p>
                </li>
              </ol>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                <img
                  src={HOSPITAL_IMAGES.atriumLobby}
                  alt="Nova Care Hospital sunlit main reception atrium"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Patient Testimonials */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t.testimonialsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Tariqul Hasan',
                  dept: 'Cardiology Preventive Suite',
                  quote:
                    'Before my visit I worried about navigating multiple tests. Here the cardiac panel, ECG, and consultation steps were clearly explained in advance.',
                },
                {
                  name: 'Nusrat Alam',
                  dept: 'Maternal & Gynaecology Care',
                  quote:
                    'Online appointment requesting and clear fasting instructions saved our family hours of waiting at reception.',
                },
                {
                  name: 'Rafiq Chowdhury',
                  dept: 'Neurology & Rehabilitation',
                  quote:
                    'Coordinated follow-up between the neurologist and physiotherapy team made each weekly goal measurable and calm.',
                },
              ].map((item) => (
                <blockquote
                  key={item.name}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 flex flex-col justify-between gap-4"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{item.quote}"
                  </p>
                  <footer className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <span> · {item.dept}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Health Articles + Searchable FAQs */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.newsTitle}
              </h2>
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
              >
                {t.viewAll}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((art) => (
                <article
                  key={art.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {art.category} · {art.publishedDate}
                      </p>
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white mt-1.5">
                        <Link to={`/news/${art.slug}`} className="hover:underline">
                          {art.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {art.summary}
                      </p>
                    </div>
                    <Link
                      to={`/news/${art.slug}`}
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Read article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* FAQ Search + Location Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t.faqTitle}
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={faqQuery}
                  onChange={(e) => setFaqQuery(e.target.value)}
                  placeholder="Search FAQs (e.g., fasting, reports, emergency)..."
                  aria-label="Search frequently asked questions"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <MapPin className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {t.contactTitle}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{settings.address}</p>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p className="font-semibold text-rose-700 dark:text-rose-400">
                  {settings.emergencyContactLabel}
                </p>
                <p>{settings.generalPhoneLabel}</p>
                <p>Email: {settings.contactEmail}</p>
              </div>
              {/* Interactive Campus Schematic Map */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>Campus Access Map</span>
                  <ShieldCheck className="w-4 h-4 text-teal-600" aria-hidden="true" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Block A · Emergency
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Main Atrium · OPD
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Diagnostic Wing
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium"
                >
                  Contact & Directions
                </Link>
                <Link
                  to="/guide"
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  Visitor Parking & Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
