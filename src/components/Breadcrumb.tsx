import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <li>
        <Link to="/" className="hover:text-[#0F2942] dark:hover:text-teal-300 transition-colors">
          Home
        </Link>
      </li>
      {items.map((item, idx) => (
        <li key={item.label + idx} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-[#0F2942] dark:hover:text-teal-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
