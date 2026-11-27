import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { BodyRegion } from '../types/hospital';

const REGIONS: { id: BodyRegion; label: string; summary: string }[] = [
  {
    id: 'head',
    label: 'Head, Brain & Sensory',
    summary: 'Neurology, Neurosurgery, Ophthalmology, ENT, Psychiatry & Dentistry',
  },
  {
    id: 'chest',
    label: 'Heart, Lungs & Chest',
    summary: 'Cardiology, Pulmonology & Critical Care',
  },
  {
    id: 'abdomen',
    label: 'Digestive, Liver & Renal',
    summary: 'Gastroenterology, Nephrology, Urology, General Surgery & Nutrition',
  },
  {
    id: 'musculoskeletal',
    label: 'Bones, Joints & Spine',
    summary: 'Orthopaedics, Rheumatology & Rehabilitation',
  },
  {
    id: 'reproductive',
    label: "Women's & Maternal Care",
    summary: 'Gynaecology, Obstetrics & Fertility Services',
  },
  {
    id: 'pediatric',
    label: 'Child & Newborn Care',
    summary: 'Paediatrics & Neonatology',
  },
  {
    id: 'systemic',
    label: 'Whole-Body, Oncology & Diagnostics',
    summary: 'Internal Medicine, Oncology, Endocrinology, Dermatology, Radiology & Labs',
  },
];

export const HumanBodyFinder: React.FC = () => {
  const { departments } = useApp();
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion>('chest');

  const matching = departments.filter((d) => d.bodyRegion === selectedRegion && d.isActive);
  const activeRegion = REGIONS.find((r) => r.id === selectedRegion)!;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Anatomical SVG Selector */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
            Select a body region to locate relevant clinical departments
          </p>
          <svg
            viewBox="0 0 220 340"
            className="w-52 h-80 select-none"
            role="img"
            aria-label="Interactive human body department selector"
          >
            {/* Head */}
            <circle
              cx="110"
              cy="44"
              r="24"
              onClick={() => setSelectedRegion('head')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'head'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            {/* Chest */}
            <rect
              x="76"
              y="76"
              width="68"
              height="62"
              rx="14"
              onClick={() => setSelectedRegion('chest')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'chest'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            {/* Abdomen */}
            <rect
              x="80"
              y="142"
              width="60"
              height="52"
              rx="10"
              onClick={() => setSelectedRegion('abdomen')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'abdomen'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            {/* Reproductive / Pelvis */}
            <rect
              x="82"
              y="198"
              width="56"
              height="32"
              rx="10"
              onClick={() => setSelectedRegion('reproductive')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'reproductive'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            {/* Arms & Legs -> Musculoskeletal */}
            <rect
              x="44"
              y="80"
              width="24"
              height="104"
              rx="10"
              onClick={() => setSelectedRegion('musculoskeletal')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'musculoskeletal'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            <rect
              x="152"
              y="80"
              width="24"
              height="104"
              rx="10"
              onClick={() => setSelectedRegion('musculoskeletal')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'musculoskeletal'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            <rect
              x="80"
              y="236"
              width="25"
              height="92"
              rx="10"
              onClick={() => setSelectedRegion('musculoskeletal')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'musculoskeletal'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
            <rect
              x="115"
              y="236"
              width="25"
              height="92"
              rx="10"
              onClick={() => setSelectedRegion('musculoskeletal')}
              className={`cursor-pointer transition-colors ${
                selectedRegion === 'musculoskeletal'
                  ? 'fill-teal-600 stroke-[#0F2942]'
                  : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-200 stroke-slate-400'
              }`}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Region Buttons + Matching Specialities */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedRegion === region.id
                    ? 'bg-[#0F2942] dark:bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {activeRegion.label}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {activeRegion.summary}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matching.map((dept) => (
                <Link
                  key={dept.id}
                  to={`/specialities/${dept.slug}`}
                  className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">
                      {dept.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {dept.services[0]}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
