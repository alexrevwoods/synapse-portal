import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Network from "./pages/Network";
import Onboarding from "./pages/Onboarding";
import PortalBuilder from "./pages/PortalBuilder";
import PublicPortal from "./pages/PublicPortal";
import Signals from "./pages/Signals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/join" component={Join} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/builder/:profileId" component={PortalBuilder} />
      <Route path="/signals/:profileId" component={Signals} />
      <Route path="/network/:profileId" component={Network} />
      <Route path="/:username" component={PublicPortal} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
