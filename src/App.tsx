import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { CompareDock } from './components/CompareDock';
import { AccessibilityModal } from './components/AccessibilityModal';
import { CookieConsentBar } from './components/CookieConsentBar';
import { BackToTop } from './components/BackToTop';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { SpecialitiesPage } from './pages/SpecialitiesPage';
import { DepartmentDetailPage } from './pages/DepartmentDetailPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { HealthPackagesPage } from './pages/HealthPackagesPage';
import { HealthPackageDetailPage } from './pages/HealthPackageDetailPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { GuidePage } from './pages/GuidePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { NewsMediaPage } from './pages/NewsMediaPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ScrollToTopOnRoute: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTopOnRoute />
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#0F2942] focus:text-white text-sm font-semibold"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:slug" element={<DoctorDetailPage />} />
                <Route path="/specialities" element={<SpecialitiesPage />} />
                <Route path="/specialities/:slug" element={<DepartmentDetailPage />} />
                <Route path="/services" element={<DiagnosticsPage mode="services" />} />
                <Route path="/diagnostics" element={<DiagnosticsPage mode="diagnostics" />} />
                <Route path="/health-packages" element={<HealthPackagesPage />} />
                <Route path="/health-packages/:slug" element={<HealthPackageDetailPage />} />
                <Route path="/appointments/book" element={<BookAppointmentPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/news" element={<NewsMediaPage />} />
                <Route path="/news/:slug" element={<ArticleDetailPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/patient-portal" element={<PatientPortalPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <GlobalSearchModal />
            <AiAssistantDrawer />
            <CompareDock />
            <AccessibilityModal />
            <CookieConsentBar />
            <BackToTop />
          </div>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
