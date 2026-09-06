import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PlatformSkinInitializer from "./components/PlatformSkinInitializer";
import { ThemeProvider } from "./contexts/ThemeContext";
import Account from "./pages/Account";
import Access from "./pages/Access";
import BrandStudio from "./pages/BrandStudio";
import Discover from "./pages/Discover";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Join from "./pages/Join";
import Moderation from "./pages/Moderation";
import Network from "./pages/Network";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import PortalBuilder from "./pages/PortalBuilder";
import PublicPortal from "./pages/PublicPortal";
import Signals from "./pages/Signals";
import SkinStudio from "./pages/SkinStudio";
import Timeline from "./pages/Timeline";
import TopicDiscovery from "./pages/TopicDiscovery";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/account" component={Account} />
      <Route path="/access" component={Access} />
      <Route path="/discover" component={Discover} />
      <Route path="/discover/:interestKey" component={TopicDiscovery} />
      <Route path="/feed" component={Feed} />
      <Route path="/skins" component={SkinStudio} />
      <Route path="/brand/:profileId" component={BrandStudio} />
      <Route path="/join" component={Join} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/builder/:profileId" component={PortalBuilder} />
      <Route path="/signals/:profileId" component={Signals} />
      <Route path="/network/:profileId" component={Network} />
      <Route path="/timeline/:profileId" component={Timeline} />
      <Route path="/notifications/:profileId" component={Notifications} />
      <Route path="/insights/:profileId" component={Insights} />
      <Route path="/moderation" component={Moderation} />
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
          <PlatformSkinInitializer>
            <Toaster theme="dark" />
            <Router />
          </PlatformSkinInitializer>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
