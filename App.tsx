import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { Space, TimeEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { RouteSeo } from './components/RouteSeo';
import { CookieBanner } from './components/CookieBanner';
import { FullscreenLoader } from './components/LoadingFallback';
import { useDeferredAuthStatus } from './hooks/useDeferredAuthStatus';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthenticatedEmailConfirmed = lazy(() => import('./routes/AuthenticatedEmailConfirmed'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiesPolicy = lazy(() => import('./pages/legal/CookiesPolicy'));
const AuthenticatedAppShell = lazy(() => import('./routes/AuthenticatedAppShell'));

const renderWithSuspense = (node: React.ReactNode) => <Suspense fallback={<FullscreenLoader />}>{node}</Suspense>;

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, user } = useDeferredAuthStatus();

  if (loading) {
    return <FullscreenLoader />;
  }

  if (user) {
    return <Navigate to="/spaces" replace />;
  }

  return <>{children}</>;
};

const LandingRoute: React.FC<{ preferredLanguage: 'en' | 'es' }> = ({ preferredLanguage }) => {
  const { user } = useDeferredAuthStatus();

  if (user) {
    return <Navigate to="/spaces" replace />;
  }

  return renderWithSuspense(
    <Landing
      preferredLanguage={preferredLanguage}
      hasAuthenticatedSession={Boolean(user)}
    />,
  );
};

const App: React.FC = () => {
  const [spaces, setSpaces] = useLocalStorage<Space[]>('spaces', []);
  const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>('timeEntries', []);

  return (
    <BrowserRouter>
      <RouteSeo />
      <Routes>
        <Route path="/login" element={renderWithSuspense(<AuthRedirect><Login /></AuthRedirect>)} />
        <Route path="/register" element={renderWithSuspense(<AuthRedirect><Register /></AuthRedirect>)} />
        <Route path="/recovery" element={renderWithSuspense(<AuthRedirect><ForgotPassword /></AuthRedirect>)} />
        <Route path="/email-confirmed" element={renderWithSuspense(<AuthenticatedEmailConfirmed />)} />
        <Route path="/update-password" element={renderWithSuspense(<UpdatePassword />)} />

        <Route path="/privacy" element={renderWithSuspense(<PrivacyPolicy />)} />
        <Route path="/terms" element={renderWithSuspense(<TermsOfService />)} />
        <Route path="/cookies" element={renderWithSuspense(<CookiesPolicy />)} />

        <Route path="/" element={<LandingRoute preferredLanguage="es" />} />
        <Route path="/en" element={<LandingRoute preferredLanguage="en" />} />

        <Route
          path="/*"
          element={renderWithSuspense(
            <AuthenticatedAppShell
              spaces={spaces}
              setSpaces={setSpaces}
              timeEntries={timeEntries}
              setTimeEntries={setTimeEntries}
            />,
          )}
        />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
};

export default App;
