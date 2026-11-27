import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { filterDoctors } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { PageMeta } from '../components/PageMeta';

export const DoctorsPage: React.FC = () => {
  const { doctors, departments, compareDoctors, toggleCompareDoctor } = useApp();
  const [query, setQuery] = useState('');
  const [departmentId, setDepartmentId] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'experience'>('name');

  const filtered = filterDoctors(doctors, {
    query,
    departmentId,
    availableOnly,
    sortBy,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Find a Doctor"
        description="Search and filter Nova Care Hospital’s specialist directory by specialty, availability, and experience."
      />
      <Breadcrumb items={[{ label: 'Find a Doctor' }]} />

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Find a Doctor
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse specialist profiles by department, today’s availability, and clinical experience.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctor name or qualification..."
            aria-label="Search doctor name"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            aria-label="Filter by specialty"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">All Specialities</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'experience')}
            aria-label="Sort doctors"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
          >
            <option value="name">Sort: Name (A–Z)</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>

        <div className="lg:col-span-3 flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            Available Today
          </label>
          <span className="text-xs text-slate-500 tabular-nums">
            {filtered.length} shown
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No doctors match your current filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDepartmentId('all');
              setAvailableOnly(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => {
            const isComparing = compareDoctors.some((c) => c.id === doc.id);
            return (
              <article
                key={doc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <DoctorAvatar
                      name={doc.name}
                      photoUrl={doc.photoUrl}
                      departmentName={doc.departmentName}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                        {doc.departmentName} · <span className="tabular-nums">{doc.experienceYears} yrs</span>
                      </p>
                      <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                        <Link to={`/doctors/${doc.slug}`} className="hover:underline">
                          {doc.name}
                        </Link>
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {doc.designation}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {doc.qualifications}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>Days: {doc.consultationDays.join(', ')}</p>
                    <p>
                      Status:{' '}
                      <span
                        className={
                          doc.isAvailableToday
                            ? 'font-medium text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-500'
                        }
                      >
                        {doc.isAvailableToday ? 'Slots Open Today' : 'Scheduled Days Only'}
                      </span>{' '}
                      · Consultation Fee: <span className="tabular-nums">BDT {doc.consultationFeeDemo.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCompareDoctor(doc)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      isComparing
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                    {isComparing ? 'Comparing' : 'Compare'}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/doctors/${doc.slug}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      Profile
                    </Link>
                    <Link
                      to={`/appointments/book?doctor=${doc.id}&department=${doc.departmentId}`}
                      className="px-3 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium whitespace-nowrap"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
