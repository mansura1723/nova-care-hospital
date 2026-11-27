import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';

interface DoctorAvatarProps {
  name: string;
  photoUrl?: string;
  departmentName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  name,
  photoUrl,
  departmentName,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .replace(/^Dr\.\s+/i, '')
    .replace(/\(Demo\)/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  const sizeClass =
    size === 'sm'
      ? 'w-14 h-14 text-base'
      : size === 'lg'
        ? 'w-32 h-32 md:w-40 md:h-40 text-3xl'
        : 'w-20 h-20 text-lg';

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={`${name} — ${departmentName}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-[#0F2942] dark:text-teal-300`}
      aria-label={`${name} portrait placeholder`}
    >
      <span className="font-display font-bold tracking-tight">{initials || 'NC'}</span>
      <Stethoscope className="w-3.5 h-3.5 mt-0.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
    </div>
  );
};
