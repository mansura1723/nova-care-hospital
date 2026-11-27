import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { PageMeta } from '../components/PageMeta';

export const DepartmentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { departments, doctors } = useApp();

  const dept = departments.find((d) => d.slug === slug);

  if (!dept) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Department Not Found
        </h1>
        <Link
          to="/specialities"
          className="inline-block px-4 py-2 rounded-lg bg-[#0F2942] text-white text-sm font-medium"
        >
          View All 30 Specialities
        </Link>
      </div>
    );
  }

  const deptDoctors = doctors.filter((doc) => doc.departmentId === dept.id);
  const related = departments.filter((d) => dept.relatedSlugs.includes(d.slug));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageMeta
        title={dept.name}
        description={`${dept.name} at Nova Care Hospital: overview, services offered, common conditions, diagnostics, and specialists.`}
      />
      <Breadcrumb
        items={[
          { label: 'Specialities', to: '/specialities' },
          { label: dept.name },
        ]}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-6 items-start">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            {dept.category} · {dept.nameBn}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {dept.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {dept.overview}
          </p>
        </div>
        <Link
          to={`/appointments/book?department=${dept.id}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold whitespace-nowrap shrink-0"
        >
          <CalendarCheck className="w-4 h-4" aria-hidden="true" />
          Book {dept.name} Consultation
        </Link>
      </div>

      {/* Services, Conditions, Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Services Offered
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {dept.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Common Conditions
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {dept.commonConditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Diagnostic Investigations
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {dept.diagnostics.map((diag) => (
              <li key={diag}>{diag}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Specialists in Department */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Available Specialists in {dept.name}
        </h2>
        {deptDoctors.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Multidisciplinary referrals for {dept.name} are coordinated through our Internal Medicine and Specialist Desk.
            </p>
            <Link
              to="/doctors"
              className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium whitespace-nowrap"
            >
              Browse All Specialists
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptDoctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <DoctorAvatar
                    name={doc.name}
                    photoUrl={doc.photoUrl}
                    departmentName={doc.departmentName}
                    size="sm"
                  />
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                      <Link to={`/doctors/${doc.slug}`} className="hover:underline">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.designation}</p>
                  </div>
                </div>
                <Link
                  to={`/appointments/book?doctor=${doc.id}&department=${dept.id}`}
                  className="px-3.5 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium whitespace-nowrap"
                >
                  Request Slot
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Departments */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Related Departments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/specialities/${rel.slug}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between hover:border-teal-600"
              >
                <span className="font-medium text-sm text-slate-900 dark:text-white">
                  {rel.name}
                </span>
                <ArrowRight className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
