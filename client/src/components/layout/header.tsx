import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/lib/auth";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold">Restaurant Manager</a>
        </Link>
        
        {user && (
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <a className="hover:text-accent-foreground">Dashboard</a>
            </Link>
            <Link href="/tip-entry">
              <a className="hover:text-accent-foreground">Tips</a>
            </Link>
            <Link href="/till-calculator">
              <a className="hover:text-accent-foreground">Till</a>
            </Link>
            <Button 
              variant="secondary" 
              onClick={() => logout()}
            >
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
