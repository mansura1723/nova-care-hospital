import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { runGlobalSearch } from '../utils/hospitalLogic';

export const GlobalSearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, doctors, departments, packages, diagnostics, articles, faqs, t } =
    useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const results = runGlobalSearch(query, {
    doctors,
    departments,
    packages,
    diagnostics,
    articles,
    faqs,
  });

  const hasResults =
    results.doctors.length > 0 ||
    results.departments.length > 0 ||
    results.packages.length > 0 ||
    results.diagnostics.length > 0 ||
    results.articles.length > 0 ||
    results.faqs.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Global hospital search"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() && (
            <div className="text-sm text-slate-500 dark:text-slate-400 space-y-3">
              <p className="font-medium text-slate-700 dark:text-slate-200">Quick shortcuts</p>
              <div className="flex flex-wrap gap-2">
                {['Cardiology', 'MRI', 'Dr. Priya', 'Executive Health', 'Emergency'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !hasResults && (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              No matching doctors, departments, packages, or diagnostics found for "{query}".
            </p>
          )}

          {results.doctors.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Doctors
              </h3>
              <div className="space-y-1">
                {results.doctors.map((d) => (
                  <Link
                    key={d.id}
                    to={`/doctors/${d.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {d.departmentName} · {d.designation}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.departments.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Specialities
              </h3>
              <div className="space-y-1">
                {results.departments.map((dept) => (
                  <Link
                    key={dept.id}
                    to={`/specialities/${dept.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {dept.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.packages.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Health Packages
              </h3>
              <div className="space-y-1">
                {results.packages.map((p) => (
                  <Link
                    key={p.id}
                    to={`/health-packages/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.category} · BDT {p.priceDemo.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.diagnostics.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Diagnostic Services
              </h3>
              <div className="space-y-1">
                {results.diagnostics.map((s) => (
                  <Link
                    key={s.id}
                    to="/diagnostics"
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.category} · {s.turnaroundTime}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.articles.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                News & Articles
              </h3>
              <div className="space-y-1">
                {results.articles.map((a) => (
                  <Link
                    key={a.id}
                    to={`/news/${a.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
