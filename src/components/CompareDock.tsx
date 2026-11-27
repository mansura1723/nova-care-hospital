import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const CompareDock: React.FC = () => {
  const {
    compareDoctors,
    toggleCompareDoctor,
    clearCompareDoctors,
    comparePackages,
    toggleComparePackage,
    clearComparePackages,
  } = useApp();

  const [openType, setOpenType] = useState<'doctors' | 'packages' | null>(null);

  if (compareDoctors.length === 0 && comparePackages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-5 left-5 z-40 flex flex-wrap gap-2">
        {compareDoctors.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
            <Scale className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {compareDoctors.length} Doctors selected
            </span>
            <button
              type="button"
              onClick={() => setOpenType('doctors')}
              className="px-2.5 py-1 rounded-md bg-[#0F2942] dark:bg-teal-600 text-white font-medium"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={clearCompareDoctors}
              aria-label="Clear doctor comparison"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {comparePackages.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
            <Scale className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {comparePackages.length} Packages selected
            </span>
            <button
              type="button"
              onClick={() => setOpenType('packages')}
              className="px-2.5 py-1 rounded-md bg-[#0F2942] dark:bg-teal-600 text-white font-medium"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={clearComparePackages}
              aria-label="Clear package comparison"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {openType === 'doctors' && compareDoctors.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Doctor comparison"
        >
          <div className="max-w-4xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Compare Specialists
              </h2>
              <button
                type="button"
                onClick={() => setOpenType(null)}
                aria-label="Close comparison"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 pr-4 text-xs text-slate-500">Attribute</th>
                    {compareDoctors.map((doc) => (
                      <th key={doc.id} className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center justify-between gap-2">
                          <span>{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCompareDoctor(doc)}
                            aria-label={`Remove ${doc.name}`}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Department</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4">{d.departmentName}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Qualifications</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4">{d.qualifications}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Experience</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4 tabular-nums">{d.experienceYears} years</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Consultation Days</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4">{d.consultationDays.join(', ')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Consultation Fee</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4 tabular-nums">
                        BDT {d.consultationFeeDemo.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Action</td>
                    {compareDoctors.map((d) => (
                      <td key={d.id} className="py-3 px-4">
                        <Link
                          to={`/appointments/book?doctor=${d.id}&department=${d.departmentId}`}
                          onClick={() => setOpenType(null)}
                          className="inline-block px-3 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium"
                        >
                          Request Slot
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {openType === 'packages' && comparePackages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Health package comparison"
        >
          <div className="max-w-4xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Compare Health Packages
              </h2>
              <button
                type="button"
                onClick={() => setOpenType(null)}
                aria-label="Close package comparison"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 pr-4 text-xs text-slate-500">Feature</th>
                    {comparePackages.map((p) => (
                      <th key={p.id} className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center justify-between gap-2">
                          <span>{p.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleComparePackage(p)}
                            aria-label={`Remove ${p.name}`}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Package Price</td>
                    {comparePackages.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-semibold tabular-nums">
                        BDT {p.priceDemo.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Target Audience</td>
                    {comparePackages.map((p) => (
                      <td key={p.id} className="py-3 px-4">{p.targetAudience}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Included Tests</td>
                    {comparePackages.map((p) => (
                      <td key={p.id} className="py-3 px-4 align-top">
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {p.includedTests.map((testName) => (
                            <li key={testName}>{testName}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Preparation</td>
                    {comparePackages.map((p) => (
                      <td key={p.id} className="py-3 px-4 text-xs">{p.preparation}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-500">Action</td>
                    {comparePackages.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <Link
                          to={`/health-packages/${p.slug}`}
                          onClick={() => setOpenType(null)}
                          className="inline-block px-3 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-medium"
                        >
                          View & Request
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
