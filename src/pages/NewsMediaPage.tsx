import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, PlayCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HOSPITAL_IMAGES } from '../data/seedData';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const NewsMediaPage: React.FC = () => {
  const { articles } = useApp();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | 'news' | 'article' | 'event' | 'story' | 'press'>('all');

  const published = articles.filter((a) => a.isPublished);
  const filtered = published.filter((a) => {
    if (kind !== 'all' && a.kind !== kind) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const events = published.filter((a) => a.kind === 'event');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageMeta
        title="News, Articles & Media"
        description="Read hospital news, health awareness articles, upcoming medical events, patient stories, and browse our media gallery."
      />
      <Breadcrumb items={[{ label: 'News & Media' }]} />

      <div className="space-y-2 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          News, Health Articles & Media
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Hospital announcements, clinician-authored health tips, awareness campaigns, patient journeys, and campus gallery highlights.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative max-w-md w-full self-start">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, articles, or campaigns..."
            aria-label="Search news and articles"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'news', label: 'Hospital News' },
            { id: 'article', label: 'Health Articles' },
            { id: 'event', label: 'Events' },
            { id: 'story', label: 'Patient Stories' },
            { id: 'press', label: 'Press Releases' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setKind(tab.id as typeof kind)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                kind === tab.id
                  ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <article
            key={art.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-2">
                <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                  {art.category} · {art.publishedDate}
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  <Link to={`/news/${art.slug}`} className="hover:underline">
                    {art.title}
                  </Link>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">{art.author}</span>
              <Link
                to={`/news/${art.slug}`}
                className="font-semibold text-teal-700 dark:text-teal-400 hover:underline"
              >
                Read full story
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Medical Event Calendar & Media Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Calendar className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Medical Event Calendar
            </h2>
          </div>
          <div className="space-y-3">
            {events.map((ev) => (
              <Link
                key={ev.id}
                to={`/news/${ev.slug}`}
                className="block rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-600"
              >
                <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                  {ev.publishedDate}
                </p>
                <p className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                  {ev.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ev.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Photo & Educational Video Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Walkthrough: Wide-Bore 3T MRI Comfort',
                img: HOSPITAL_IMAGES.diagnosticMri,
                duration: '02:45 Walkthrough',
              },
              {
                title: 'Preventive Cardiology Checkup Orientation',
                img: HOSPITAL_IMAGES.healthCheckup,
                duration: '03:20 Patient Guide',
              },
            ].map((vid) => (
              <div
                key={vid.title}
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="relative aspect-[16/10] bg-slate-900">
                  <img
                    src={vid.img}
                    alt={vid.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-3 text-white">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <PlayCircle className="w-5 h-5 text-teal-300 shrink-0" aria-hidden="true" />
                      <span>{vid.duration}</span>
                    </div>
                  </div>
                </div>
                <p className="p-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {vid.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
