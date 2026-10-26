import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/layout/ProtectedRoute';
import OnboardingGuard from './components/layout/OnboardingGuard';

// Lazy-loaded pages
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const OnboardingPage     = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const WorldMapPage       = lazy(() => import('./pages/WorldMapPage'));
const MissionPage        = lazy(() => import('./pages/MissionPage'));
const PlatformerPage     = lazy(() => import('./pages/PlatformerPage'));
const StockAcademyPage   = lazy(() => import('./pages/StockAcademyPage'));
const StockLessonPage    = lazy(() => import('./pages/StockLessonPage'));
const TradingTerminalPage= lazy(() => import('./pages/TradingTerminalPage'));
const PortfolioPage      = lazy(() => import('./pages/PortfolioPage'));
const FinancialToolsPage = lazy(() => import('./pages/FinancialToolsPage'));
const FinanceManagerPage = lazy(() => import('./pages/FinanceManagerPage'));
const BudgetSimulatorPage= lazy(() => import('./pages/BudgetSimulatorPage'));
const ScamDetectivePage  = lazy(() => import('./pages/ScamDetectivePage'));
const EntrepreneurPage   = lazy(() => import('./pages/EntrepreneurPage'));
const AchievementsPage   = lazy(() => import('./pages/AchievementsPage'));
const LeaderboardPage    = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const PricingPage        = lazy(() => import('./pages/PricingPage'));
const AdminPage          = lazy(() => import('./pages/AdminPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/forgot-password"element={<ForgotPasswordPage />} />
        <Route path="/pricing"        element={<PricingPage />} />
        <Route path="/leaderboard"    element={<LeaderboardPage />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

        {/* Protected: Dashboard & Profile only */}
        <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/portfolio"  element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
        <Route path="/admin/*"    element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

        {/* Public feature pages — no auth required */}
        <Route path="/worlds"           element={<WorldMapPage />} />
        <Route path="/worlds/:worldId/missions/:missionId" element={<MissionPage />} />
        <Route path="/games/platformer/:level?" element={<GameProvider><PlatformerPage /></GameProvider>} />
        <Route path="/stock-academy"    element={<StockAcademyPage />} />
        <Route path="/stock-academy/lessons/:lessonId" element={<StockLessonPage />} />
        <Route path="/trading"          element={<TradingTerminalPage />} />
        <Route path="/tools"            element={<FinancialToolsPage />} />
        <Route path="/finance-manager"  element={<FinanceManagerPage />} />
        <Route path="/budget-simulator" element={<BudgetSimulatorPage />} />
        <Route path="/scam-detective"   element={<ScamDetectivePage />} />
        <Route path="/entrepreneur"     element={<EntrepreneurPage />} />
        <Route path="/achievements"     element={<AchievementsPage />} />
        <Route path="*"                 element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) document.documentElement.classList.add('reduce-motion');
  }, []);

  return (
    <AuthProvider>
      <div style={{ background: '#06041a', minHeight: '100vh' }}>
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
