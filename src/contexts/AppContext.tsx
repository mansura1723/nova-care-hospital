import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  DEFAULT_WEBSITE_SETTINGS,
  SEED_ARTICLES,
  SEED_DEPARTMENTS,
  SEED_DIAGNOSTICS,
  SEED_DOCTORS,
  SEED_FAQS,
  SEED_HEALTH_PACKAGES,
  SEED_JOBS,
} from '../data/seedData';
import { TRANSLATIONS } from '../data/translations';
import {
  checkAndEnsureAdmin,
  ensurePatientProfile,
  fetchPublicCatalogs,
} from '../services/hospitalService';
import { safeStorageGet, safeStorageSet } from '../utils/hospitalLogic';
import type {
  Article,
  Department,
  DiagnosticService,
  Doctor,
  FaqItem,
  HealthPackage,
  JobListing,
  Language,
  PatientProfile,
  ThemeMode,
  WebsiteSettings,
} from '../types/hospital';

interface AppContextValue {
  user: User | null;
  patientProfile: PatientProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof TRANSLATIONS)['en'];

  theme: ThemeMode;
  toggleTheme: () => void;

  fontScale: 'normal' | 'large';
  setFontScale: (scale: 'normal' | 'large') => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;

  doctors: Doctor[];
  departments: Department[];
  packages: HealthPackage[];
  diagnostics: DiagnosticService[];
  articles: Article[];
  jobs: JobListing[];
  faqs: FaqItem[];
  settings: WebsiteSettings;
  catalogLoading: boolean;
  refreshCatalogs: () => Promise<void>;

  compareDoctors: Doctor[];
  toggleCompareDoctor: (doctor: Doctor) => void;
  clearCompareDoctors: () => void;

  comparePackages: HealthPackage[];
  toggleComparePackage: (pkg: HealthPackage) => void;
  clearComparePackages: () => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  accessibilityOpen: boolean;
  setAccessibilityOpen: (open: boolean) => void;
  cookieConsent: 'unset' | 'essential' | 'all';
  setCookieConsent: (val: 'essential' | 'all') => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeStorageGet('novacare_lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = safeStorageGet('novacare_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [fontScale, setFontScaleState] = useState<'normal' | 'large'>(() =>
    safeStorageGet('novacare_font_scale') === 'large' ? 'large' : 'normal'
  );
  const [highContrast, setHighContrastState] = useState<boolean>(
    () => safeStorageGet('novacare_contrast') === 'true'
  );

  const [doctors, setDoctors] = useState<Doctor[]>(SEED_DOCTORS);
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [packages, setPackages] = useState<HealthPackage[]>(SEED_HEALTH_PACKAGES);
  const [diagnostics, setDiagnostics] = useState<DiagnosticService[]>(SEED_DIAGNOSTICS);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [jobs, setJobs] = useState<JobListing[]>(SEED_JOBS);
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [compareDoctors, setCompareDoctors] = useState<Doctor[]>([]);
  const [comparePackages, setComparePackages] = useState<HealthPackage[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [cookieConsent, setCookieConsentState] = useState<'unset' | 'essential' | 'all'>(() => {
    const saved = safeStorageGet('novacare_cookie_consent');
    if (saved === 'essential' || saved === 'all') return saved;
    return 'unset';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    safeStorageSet('novacare_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-large', fontScale === 'large');
    safeStorageSet('novacare_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-contrast', highContrast);
    safeStorageSet('novacare_contrast', String(highContrast));
  }, [highContrast]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeStorageSet('novacare_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setFontScale = (scale: 'normal' | 'large') => setFontScaleState(scale);
  const setHighContrast = (enabled: boolean) => setHighContrastState(enabled);

  const setCookieConsent = (val: 'essential' | 'all') => {
    setCookieConsentState(val);
    safeStorageSet('novacare_cookie_consent', val);
  };

  const refreshCatalogs = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const res = await fetchPublicCatalogs();
      setDoctors(res.doctors);
      setDepartments(res.departments);
      setPackages(res.packages);
      setDiagnostics(res.diagnostics);
      setArticles(res.articles);
      setJobs(res.jobs);
      setSettings(res.settings);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalogs();
  }, [refreshCatalogs]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setPatientProfile(null);
      setIsAdmin(false);
      return;
    }
    const [adminFlag, profile] = await Promise.all([
      checkAndEnsureAdmin(auth.currentUser),
      ensurePatientProfile(auth.currentUser),
    ]);
    setIsAdmin(adminFlag);
    setPatientProfile(profile);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified) {
        try {
          const [adminFlag, profile] = await Promise.all([
            checkAndEnsureAdmin(nextUser),
            ensurePatientProfile(nextUser),
          ]);
          setIsAdmin(adminFlag);
          setPatientProfile(profile);
        } catch (err) {
          console.error('Auth profile sync issue:', err);
        }
      } else {
        setIsAdmin(false);
        setPatientProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setPatientProfile(null);
    setIsAdmin(false);
  };

  const toggleCompareDoctor = (doctor: Doctor) => {
    setCompareDoctors((prev) => {
      const exists = prev.some((d) => d.id === doctor.id);
      if (exists) return prev.filter((d) => d.id !== doctor.id);
      if (prev.length >= 3) return [...prev.slice(1), doctor];
      return [...prev, doctor];
    });
  };

  const toggleComparePackage = (pkg: HealthPackage) => {
    setComparePackages((prev) => {
      const exists = prev.some((p) => p.id === pkg.id);
      if (exists) return prev.filter((p) => p.id !== pkg.id);
      if (prev.length >= 3) return [...prev.slice(1), pkg];
      return [...prev, pkg];
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        patientProfile,
        isAdmin,
        authReady,
        authLoading,
        authError,
        signInWithGoogle,
        logout,
        refreshProfile,
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        theme,
        toggleTheme,
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        doctors,
        departments,
        packages,
        diagnostics,
        articles,
        jobs,
        faqs: SEED_FAQS,
        settings,
        catalogLoading,
        refreshCatalogs,
        compareDoctors,
        toggleCompareDoctor,
        clearCompareDoctors: () => setCompareDoctors([]),
        comparePackages,
        toggleComparePackage,
        clearComparePackages: () => setComparePackages([]),
        searchOpen,
        setSearchOpen,
        assistantOpen,
        setAssistantOpen,
        accessibilityOpen,
        setAccessibilityOpen,
        cookieConsent,
        setCookieConsent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
