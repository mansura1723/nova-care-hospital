import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { filterHealthPackages } from '../utils/hospitalLogic';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const HealthPackagesPage: React.FC = () => {
  const { packages, comparePackages, toggleComparePackage } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(packages.filter((p) => p.isPublished).map((p) => p.category)))];
  const filtered = filterHealthPackages(packages, { query, category });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageMeta
        title="Health Checkup Packages"
        description="Browse and compare Nova Care Hospital’s 10 preventive health checkup packages with transparent pricing and included tests."
      />
      <Breadcrumb items={[{ label: 'Health Packages' }]} />

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Preventive Health Checkup Packages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Compare preventive screening panels designed for adults, seniors, women, men, children, cardiac risk, and diabetes care.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search package name or included test (e.g., HbA1c, Echo)..."
            aria-label="Search health packages"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                category === cat
                  ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pkg) => {
          const isComparing = comparePackages.some((c) => c.id === pkg.id);
          return (
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
                <div className="p-6 space-y-2.5">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    {pkg.category} · <span className="tabular-nums">{pkg.includedTests.length} included tests</span>
                  </p>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    <Link to={`/health-packages/${pkg.slug}`} className="hover:underline">
                      {pkg.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pkg.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For: {pkg.targetAudience}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-500">Package Price</p>
                  <p className="font-display font-bold text-slate-900 dark:text-white tabular-nums">
                    BDT {pkg.priceDemo.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleComparePackage(pkg)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                      isComparing
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                    {isComparing ? 'Added' : 'Compare'}
                  </button>
                  <Link
                    to={`/health-packages/${pkg.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
