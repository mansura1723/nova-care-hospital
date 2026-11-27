import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  Download,
  Globe,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HospitalBrandMark } from './HospitalBrandMark';

export const Footer: React.FC = () => {
  const {
    t,
    settings,
    language,
    setLanguage,
    theme,
    toggleTheme,
    setAccessibilityOpen,
  } = useApp();

  return (
    <footer className="bg-[#0B1D30] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Emergency Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <HospitalBrandMark className="w-8 h-8" />
              <span className="font-display text-lg font-bold tracking-tight">
                {settings.hospitalName}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.address}
            </p>
            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              <p className="font-medium text-teal-300">{settings.emergencyContactLabel}</p>
              <p>{settings.generalPhoneLabel}</p>
              <p>{settings.contactEmail}</p>
            </div>
          </div>

          {/* Clinical Links */}
          <div>
            <h2 className="font-display text-sm font-semibold text-white mb-4">
              Clinical Navigation
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-teal-300 transition-colors">
                  {t.navDoctors}
                </Link>
              </li>
              <li>
                <Link to="/specialities" className="hover:text-teal-300 transition-colors">
                  {t.navSpecialities} (30)
                </Link>
              </li>
              <li>
                <Link to="/diagnostics" className="hover:text-teal-300 transition-colors">
                  {t.navDiagnostics}
                </Link>
              </li>
              <li>
                <Link to="/health-packages" className="hover:text-teal-300 transition-colors">
                  {t.navHealthPackages}
                </Link>
              </li>
              <li>
                <Link to="/appointments/book" className="hover:text-teal-300 transition-colors">
                  {t.bookAppointment}
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="text-rose-300 hover:text-rose-200 transition-colors">
                  {t.navEmergency}
                </Link>
              </li>
            </ul>
          </div>

          {/* Patient & Institutional */}
          <div>
            <h2 className="font-display text-sm font-semibold text-white mb-4">
              Patient & Hospital
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t.navAbout}
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-teal-300 transition-colors">
                  {t.navPatientGuide}
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-teal-300 transition-colors">
                  {t.navNewsMedia}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-teal-300 transition-colors">
                  {t.navCareers}
                </Link>
              </li>
              <li>
                <Link to="/patient-portal" className="hover:text-teal-300 transition-colors">
                  {t.patientPortal}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-300 transition-colors">
                  {t.adminConsole}
                </Link>
              </li>
            </ul>
          </div>

          {/* Brochures & Preferences */}
          <div className="space-y-4">
            <h2 className="font-display text-sm font-semibold text-white">
              Brochures & Controls
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/api/brochure/patient-guide"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-teal-300"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Patient & Visitor Guide (.txt)
                </a>
              </li>
              <li>
                <a
                  href="/api/brochure/health-packages"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-teal-300"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Health Packages Summary (.txt)
                </a>
              </li>
              <li>
                <a
                  href="/api/brochure/emergency-preparedness"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-teal-300"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Emergency Readiness Sheet (.txt)
                </a>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-white"
              >
                <Globe className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                {language === 'en' ? 'English · বাংলা' : 'বাংলা · English'}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-white"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                    Dark
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                    Light
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAccessibilityOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-white"
              >
                <Accessibility className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                A11y
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-400">
          <p className="max-w-3xl leading-relaxed">
            {t.demoNotice}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/privacy" className="inline-flex items-center gap-1 hover:text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
              Privacy & Cookies
            </Link>
            <span>© {new Date().getFullYear()} {settings.hospitalName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
