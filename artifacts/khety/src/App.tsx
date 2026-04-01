import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { VipWelcomeModal } from "@/components/VipWelcomeModal";
import { InstallGate } from "@/components/InstallGate";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useAppSettings, PageVisibility, DEFAULT_PAGE_VISIBILITY } from "@/hooks/useAppSettings";
import NotFound from "@/pages/not-found";
import { useEffect, createContext, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { applyLangDirection } from "@/i18n";

import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import LandmarkDetail from "@/pages/LandmarkDetail";
import MapPage from "@/pages/Map";
import Chat from "@/pages/Chat";
import Safety from "@/pages/Safety";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import FindGuide from "@/pages/FindGuide";
import Onboarding from "@/pages/Onboarding";
import SupportChat from "@/pages/SupportChat";
import Transit from "@/pages/Transit";
import Community from "@/pages/Community";
import UserPublicProfile from "@/pages/UserPublicProfile";
import Invite from "@/pages/Invite";
import Pricing from "@/pages/Pricing";
import Subscription from "@/pages/Subscription";
import BillingPortal from "@/pages/BillingPortal";
import UpdateCard from "@/pages/UpdateCard";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  }
});

// ─── Visibility Context ────────────────────────────────────────────────────────
// Using a context avoids creating new arrow-function component types on every
// render (which would force React to unmount/remount the entire page tree).
type VisCtx = { pv: PageVisibility; isAdmin: boolean; settingsLoading: boolean };
const VisibilityCtx = createContext<VisCtx>({
  pv: DEFAULT_PAGE_VISIBILITY,
  isAdmin: false,
  settingsLoading: true,
});

// ─── Auth-aware route guards ───────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/" />;
  return <Component />;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/register" />;
  return <Onboarding />;
}

// ─── PageGuard — reads from context, stable component reference ───────────────
function PageGuard({ pageKey, component: Component }: {
  pageKey: keyof PageVisibility;
  component: React.ComponentType;
}) {
  const { pv, isAdmin, settingsLoading } = useContext(VisibilityCtx);
  if (settingsLoading) return null;
  if (!isAdmin && pv[pageKey] === false) return <Redirect to="/" />;
  return <Component />;
}

// Module-level stable wrappers — these never change identity, so React will
// never unmount a page just because the parent re-renders.
const HomeRoute       = () => <PageGuard pageKey="home"    component={Home} />;
const ExploreRoute    = () => <PageGuard pageKey="explore"  component={Explore} />;
const MapRoute        = () => <PageGuard pageKey="map"      component={MapPage} />;
const ChatRoute       = () => <PageGuard pageKey="chat"     component={Chat} />;
const SafetyRoute     = () => <PageGuard pageKey="safety"   component={Safety} />;
const TransitRoute    = () => <PageGuard pageKey="transit"  component={Transit} />;
const CommunityRoute  = () => <PageGuard pageKey="community" component={Community} />;
const GuidesRoute     = () => <PageGuard pageKey="guides"   component={FindGuide} />;
const SupportRoute    = () => <PageGuard pageKey="support"  component={SupportChat} />;
const InviteRoute     = () => <ProtectedRoute component={Invite} />;
const AdminRoute      = () => <ProtectedRoute component={Admin} />;
const LoginRoute      = () => <AuthRoute component={Login} />;
const RegisterRoute   = () => <AuthRoute component={Register} />;

// ─── AppInner ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { user, profile } = useAuth();
  const { i18n } = useTranslation("t");
  const { settings, loading: settingsLoading } = useAppSettings();
  useVisitorTracking(user?.id);

  const isAdmin = profile?.role === "admin" ||
    (ADMIN_EMAIL !== "" && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  useEffect(() => {
    applyLangDirection(i18n.language);
  }, [i18n.language]);

  const ctxValue = useMemo<VisCtx>(
    () => ({ pv: settings.page_visibility, isAdmin, settingsLoading }),
    [settings.page_visibility, isAdmin, settingsLoading]
  );

  return (
    <VisibilityCtx.Provider value={ctxValue}>
      <InstallGate />
      <WelcomeSplash />
      <VipWelcomeModal />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Layout>
          <Switch>
            <Route path="/"               component={HomeRoute} />
            <Route path="/explore"        component={ExploreRoute} />
            <Route path="/landmarks/:id"  component={LandmarkDetail} />
            <Route path="/map"            component={MapRoute} />
            <Route path="/chat"           component={ChatRoute} />
            <Route path="/safety"         component={SafetyRoute} />
            <Route path="/transit"        component={TransitRoute} />
            <Route path="/community"      component={CommunityRoute} />
            <Route path="/user/:userId"   component={UserPublicProfile} />
            <Route path="/guides"         component={GuidesRoute} />
            <Route path="/support"        component={SupportRoute} />
            <Route path="/profile"        component={Profile} />
            <Route path="/invite"         component={InviteRoute} />
            <Route path="/pricing"        component={Pricing} />
            <Route path="/subscription"   component={Subscription} />
            <Route path="/billing"        component={BillingPortal} />
            <Route path="/update-card"    component={UpdateCard} />
            <Route path="/admin"          component={AdminRoute} />
            <Route path="/login"          component={LoginRoute} />
            <Route path="/register"       component={RegisterRoute} />
            <Route path="/onboarding"     component={OnboardingRoute} />
            <Route                        component={NotFound} />
          </Switch>
        </Layout>
      </WouterRouter>
    </VisibilityCtx.Provider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppInner />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
