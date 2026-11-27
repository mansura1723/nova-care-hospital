import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { HumanBodyFinder } from '../components/HumanBodyFinder';
import { PageMeta } from '../components/PageMeta';

export const SpecialitiesPage: React.FC = () => {
  const { departments, language } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(departments.map((d) => d.category)))];

  const filtered = departments.filter((d) => {
    if (!d.isActive) return false;
    if (category !== 'all' && d.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.nameBn.toLowerCase().includes(q) ||
      d.overview.toLowerCase().includes(q) ||
      d.commonConditions.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageMeta
        title="Medical Specialities"
        description="Explore all 30 medical and surgical departments at Nova Care Hospital or use our interactive body department finder."
      />
      <Breadcrumb items={[{ label: 'Medical Specialities' }]} />

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Medical Specialities ({departments.filter((d) => d.isActive).length})
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse our full multidisciplinary directory of clinical departments, common treated conditions, and available diagnostic investigations.
        </p>
      </div>

      <HumanBodyFinder />

      {/* Search & Category Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="relative max-w-md w-full self-start">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search department or condition..."
              aria-label="Search specialities"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dept) => (
            <Link
              key={dept.id}
              to={`/specialities/${dept.slug}`}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4 hover:border-teal-600 dark:hover:border-teal-500 transition-colors"
            >
              <div>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                  {dept.category}
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  {language === 'bn' && dept.nameBn ? dept.nameBn : dept.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {dept.overview}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{dept.services.length} clinical services</span>
                <ArrowRight className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
