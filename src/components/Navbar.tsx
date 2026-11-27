import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  Moon,
  PhoneCall,
  Search,
  Sun,
  UserCircle2,
  X,
  Accessibility,
  Globe,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { HospitalBrandMark } from './HospitalBrandMark';

export const Navbar: React.FC = () => {
  const {
    t,
    user,
    isAdmin,
    language,
    setLanguage,
    theme,
    toggleTheme,
    setSearchOpen,
    setAccessibilityOpen,
  } = useApp();

  const [openDropdown, setOpenDropdown] = useState<'services' | 'guide' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive
        ? 'text-[#0F2942] dark:text-teal-300 border-teal-600 dark:border-teal-400'
        : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-[#0F2942] dark:hover:text-white'
    }`;

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-teal-600 rounded-md"
        >
          <HospitalBrandMark className="w-8 h-8" />
          <span className="font-display text-lg font-bold tracking-tight text-[#0F2942] dark:text-white">
            {t.brandName}
          </span>
        </Link>

        {/* Zone 2: Concise Single-Line Nav Links with Dropdowns */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
          <NavLink to="/about" className={linkClass}>
            {t.navAbout}
          </NavLink>

          <NavLink to="/doctors" className={linkClass}>
            {t.navDoctors}
          </NavLink>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((p) => (p === 'services' ? null : 'services'))}
              aria-expanded={openDropdown === 'services'}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
                ['/specialities', '/services', '/diagnostics', '/health-packages'].some((p) =>
                  location.pathname.startsWith(p)
                )
                  ? 'text-[#0F2942] dark:text-teal-300 border-teal-600 dark:border-teal-400'
                  : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-[#0F2942] dark:hover:text-white'
              }`}
            >
              <span>{t.navServices}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {openDropdown === 'services' && (
              <div className="absolute left-0 top-full mt-2 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-2 z-50">
                <Link
                  to="/specialities"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navSpecialities} (30)
                </Link>
                <Link
                  to="/services"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navMedicalServices}
                </Link>
                <Link
                  to="/diagnostics"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navDiagnostics}
                </Link>
                <Link
                  to="/health-packages"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navHealthPackages}
                </Link>
                <Link
                  to="/emergency"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  {t.navEmergency}
                </Link>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((p) => (p === 'guide' ? null : 'guide'))}
              aria-expanded={openDropdown === 'guide'}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
                ['/guide', '/news', '/careers'].some((p) => location.pathname.startsWith(p))
                  ? 'text-[#0F2942] dark:text-teal-300 border-teal-600 dark:border-teal-400'
                  : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-[#0F2942] dark:hover:text-white'
              }`}
            >
              <span>{t.navGuideMedia}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {openDropdown === 'guide' && (
              <div className="absolute left-0 top-full mt-2 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-2 z-50">
                <Link
                  to="/guide"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navPatientGuide}
                </Link>
                <Link
                  to="/news"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navNewsMedia}
                </Link>
                <Link
                  to="/careers"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.navCareers}
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/contact" className={linkClass}>
            {t.navContact}
          </NavLink>
        </nav>

        {/* Zone 3: Global Search, Portal Link & Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open global search"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          <Link
            to="/patient-portal"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <UserCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span>{user ? t.patientPortal : t.patientLogin}</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden xl:inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 whitespace-nowrap shrink-0"
            >
              {t.adminConsole}
            </Link>
          )}

          <Link
            to="/appointments/book"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-medium hover:bg-[#163a5c] dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0"
          >
            {t.bookAppointment}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Utility Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Link
              to="/appointments/book"
              className="col-span-2 text-center py-2.5 px-4 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-medium"
            >
              {t.bookAppointment}
            </Link>
            <Link
              to="/emergency"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900"
            >
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              {t.navEmergency}
            </Link>
            <Link
              to="/patient-portal"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium"
            >
              <UserCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              {user ? t.patientPortal : t.patientLogin}
            </Link>
          </div>

          <div className="flex flex-col space-y-1 text-sm">
            {[
              { to: '/', label: t.navHome },
              { to: '/about', label: t.navAbout },
              { to: '/doctors', label: t.navDoctors },
              { to: '/specialities', label: t.navSpecialities },
              { to: '/services', label: t.navMedicalServices },
              { to: '/diagnostics', label: t.navDiagnostics },
              { to: '/health-packages', label: t.navHealthPackages },
              { to: '/guide', label: t.navPatientGuide },
              { to: '/news', label: t.navNewsMedia },
              { to: '/careers', label: t.navCareers },
              { to: '/contact', label: t.navContact },
              { to: '/admin', label: t.adminConsole },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'en' ? 'বাংলা (BN)' : 'English (EN)'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  Light Mode
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setAccessibilityOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
              Accessibility
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
