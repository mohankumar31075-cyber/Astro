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
import PacksPage from './pages/PacksPage';
import NotFound from './pages/NotFound';

const PAGE_TITLES: Record<string, string> = {
  '/': 'AstroSutra — Vedic astrology, computed',
  '/welcome': 'Create your chart · AstroSutra',
  '/how-it-works': 'How the numbers are made · AstroSutra',
  '/dashboard': 'Today · AstroSutra',
  '/chart': 'Your birth chart · AstroSutra',
  '/horoscope': 'Daily reading · AstroSutra',
  '/match': 'Compatibility · AstroSutra',
  '/ask': 'Ask Sutra · AstroSutra',
  '/panchang': 'Panchang & muhurta · AstroSutra',
  '/reports': 'Your reports · AstroSutra',
  '/family': 'Your circle · AstroSutra',
  '/settings': 'Settings & data · AstroSutra',
  '/learn': 'Astropedia · AstroSutra',
  '/packs': 'Plans & packs · AstroSutra',
};

/**
 * Keeps the tab title, the scroll position and the document language in step
 * with the route. Every screen used to share one static title, which is poor
 * for the browser's history, for bookmarks and for screen-reader users moving
 * between tabs.
 */
function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    const base =
      PAGE_TITLES[pathname] ??
      (pathname.startsWith('/reports/')
        ? `${pathname.split('/')[2].replace(/^./, (c) => c.toUpperCase())} report · AstroSutra`
        : pathname.startsWith('/horoscope/')
          ? `${pathname.split('/')[2].replace(/^./, (c) => c.toUpperCase())} · Daily reading · AstroSutra`
          : pathname.startsWith('/legal/')
            ? `${pathname.split('/')[2].replace(/^./, (c) => c.toUpperCase())} · AstroSutra`
            : 'AstroSutra');
    document.title = base;
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <RouteEffects />
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
          <Route path="/packs" element={<PacksPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
