import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/lib/auth";
import { Link } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-xl font-bold">Yeti Tips & Till</span>
          </a>
        </Link>

        {user && (
          <>
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Navigation Links */}
            <nav className={`
              ${isMenuOpen ? 'flex' : 'hidden'} 
              md:flex items-center gap-4
              absolute md:relative
              top-full left-0 right-0
              md:top-auto md:left-auto md:right-auto
              flex-col md:flex-row
              bg-primary md:bg-transparent
              p-4 md:p-0
              shadow-md md:shadow-none
              z-50
              w-full md:w-auto
            `}>
              {user.isAdmin && (
                <>
                  <Link href="/dashboard">
                    <a className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0">
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/employees">
                    <a className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0">
                      Employees
                    </a>
                  </Link>
                </>
              )}
              <Link href="/tip-entry">
                <a className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0">
                  Tips
                </a>
              </Link>
              <Link href="/till-calculator">
                <a className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0">
                  Till
                </a>
              </Link>
              <Link href="/profile">
                <a className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0">
                  Profile
                </a>
              </Link>
              <Button 
                variant="secondary" 
                onClick={() => logout()}
                className="w-full md:w-auto mt-2 md:mt-0"
              >
                Logout
              </Button>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}