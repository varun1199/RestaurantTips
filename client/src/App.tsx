import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./lib/auth";
import { Header } from "./components/layout/header";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TipEntry from "@/pages/tip-entry";
import TillCalculator from "@/pages/till-calculator";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Component {...rest} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/" component={() => <Redirect to="/dashboard" />} />
            <Route path="/dashboard" component={() => (
              <PrivateRoute component={Dashboard} />
            )} />
            <Route path="/tip-entry" component={() => (
              <PrivateRoute component={TipEntry} />
            )} />
            <Route path="/till-calculator" component={() => (
              <PrivateRoute component={TillCalculator} />
            )} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
