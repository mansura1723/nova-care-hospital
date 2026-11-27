import React from 'react';

export const HospitalBrandMark: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="9" fill="#0F2942" />
    <path
      d="M18 7.5V28.5M7.5 18H28.5"
      stroke="#14B8A6"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="18" r="3.2" fill="#FFFFFF" />
  </svg>
);
