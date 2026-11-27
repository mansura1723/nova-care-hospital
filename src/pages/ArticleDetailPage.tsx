import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Share2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageMeta } from '../components/PageMeta';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles } = useApp();
  const [copied, setCopied] = useState(false);

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Article Not Found</h1>
        <Link to="/news" className="inline-block px-4 py-2 rounded-lg bg-[#0F2942] text-white text-sm">
          Back to News & Media
        </Link>
      </div>
    );
  }

  const related = articles.filter((a) => a.id !== article.id && a.isPublished).slice(0, 3);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageMeta title={article.title} description={article.summary} />
      <Breadcrumb
        items={[
          { label: 'News & Media', to: '/news' },
          { label: article.title },
        ]}
      />

      <article className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            {article.category} · {article.publishedDate} · {article.author}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hospital Health Publication
            </p>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Share Article
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/9]">
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {article.content.split('\n\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </article>

      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {related.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.slug}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-teal-600"
            >
              <p className="text-xs text-slate-500">{item.category}</p>
              <p className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
