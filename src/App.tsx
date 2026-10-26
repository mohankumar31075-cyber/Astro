import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout, RequireProfile } from './components/Layout';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ChartPage from './pages/ChartPage';
import HoroscopePage from './pages/HoroscopePage';
import MatchPage from './pages/MatchPage';
import AskPage from './pages/AskPage';
import PanchangPage from './pages/PanchangPage';
import ReportsPage from './pages/ReportsPage';
import ReportPage from './pages/ReportPage';
import FamilyPage from './pages/FamilyPage';
import SettingsPage from './pages/SettingsPage';
import LearnPage from './pages/LearnPage';
import LegalPage from './pages/LegalPage';
import HowItWorks from './pages/HowItWorks';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route
          element={
            <RequireProfile>
              <Layout />
            </RequireProfile>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/horoscope" element={<HoroscopePage />} />
          <Route path="/horoscope/:slug" element={<HoroscopePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:slug" element={<ReportPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/learn" element={<LearnPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
