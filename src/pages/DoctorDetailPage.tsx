import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, Clock, Globe } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { PageMeta } from '../components/PageMeta';

export const DoctorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { doctors } = useApp();
  const doctor = doctors.find((d) => d.slug === slug);

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Specialist Profile Not Found
        </h1>
        <Link
          to="/doctors"
          className="inline-block px-4 py-2 rounded-lg bg-[#0F2942] text-white text-sm font-medium"
        >
          Back to Doctor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title={doctor.name}
        description={`${doctor.name} — ${doctor.designation} in ${doctor.departmentName} at Nova Care Hospital.`}
      />
      <Breadcrumb
        items={[
          { label: 'Find a Doctor', to: '/doctors' },
          { label: doctor.name },
        ]}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <DoctorAvatar
            name={doctor.name}
            photoUrl={doctor.photoUrl}
            departmentName={doctor.departmentName}
            size="lg"
          />
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {doctor.departmentName} · <span className="tabular-nums">{doctor.experienceYears} years experience</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {doctor.name}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
              {doctor.designation}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{doctor.qualifications}</p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-600" aria-hidden="true" />
                Languages: {doctor.languages.join(', ')}
              </span>
              <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                Consultation Fee: BDT {doctor.consultationFeeDemo.toLocaleString()}
              </span>
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                to={`/appointments/book?doctor=${doctor.id}&department=${doctor.departmentId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-semibold"
              >
                <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                Request Appointment
              </Link>
              <Link
                to={`/specialities/${doctor.departmentId}`}
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Explore {doctor.departmentName}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Clinical Profile
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Consultation Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Days: {doctor.consultationDays.join(' · ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <Link
                  key={slot}
                  to={`/appointments/book?doctor=${doctor.id}&department=${doctor.departmentId}&slot=${encodeURIComponent(slot)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-teal-600"
                >
                  <Clock className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  {slot}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
