import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./lib/auth";
import { Header } from "./components/layout/header";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import TipEntry from "@/pages/tip-entry";
import TillCalculator from "@/pages/till-calculator";
import EmployeeManagement from "@/pages/employee-management";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  // Only allow admin users to access the dashboard and employee management
  if (rest.requireAdmin && !user.isAdmin) return <Redirect to="/tip-entry" />;
  return <Component {...rest} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-screen-xl">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/" component={() => <Redirect to="/tip-entry" />} />
            <Route path="/dashboard" component={() => (
              <PrivateRoute component={Dashboard} requireAdmin={true} />
            )} />
            <Route path="/employees" component={() => (
              <PrivateRoute component={EmployeeManagement} requireAdmin={true} />
            )} />
            <Route path="/tip-entry" component={() => (
              <PrivateRoute component={TipEntry} />
            )} />
            <Route path="/till-calculator" component={() => (
              <PrivateRoute component={TillCalculator} />
            )} />
            <Route path="/profile" component={() => (
              <PrivateRoute component={ProfilePage} />
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