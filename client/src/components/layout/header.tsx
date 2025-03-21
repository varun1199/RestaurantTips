import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/lib/auth";
import { Link } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close the menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Custom NavLink component that closes the menu on click
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href}>
      <a 
        className="hover:text-accent-foreground w-full md:w-auto text-center py-2 md:py-0"
        onClick={closeMenu}
      >
        {children}
      </a>
    </Link>
  );

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
              fixed md:relative
              top-[64px] md:top-auto
              left-0 right-0
              flex-col md:flex-row
              bg-primary md:bg-transparent
              p-4 md:p-0
              shadow-md md:shadow-none
              z-50
              w-full md:w-auto
              border-t border-primary-foreground/10 md:border-none
            `}>
              {user.isAdmin && (
                <>
                  <NavLink href="/dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink href="/employees">
                    Employees
                  </NavLink>
                </>
              )}
              <NavLink href="/tip-entry">
                Tips
              </NavLink>
              <NavLink href="/till-calculator">
                Till
              </NavLink>
              <NavLink href="/profile">
                Profile
              </NavLink>
              <Button 
                variant="secondary" 
                onClick={() => {
                  closeMenu();
                  logout();
                }}
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