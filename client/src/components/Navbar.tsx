import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { title: "Home", path: "/", active: isActive("/") },
    { title: "Donors", path: "/donors", active: isActive("/donors") },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-heading font-semibold text-xl text-neutral-800">LifeShare</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    link.active 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-neutral-800 hover:text-primary border-b-2 border-transparent"
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-neutral-800 hover:text-primary font-medium text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-red-700 text-white font-medium text-sm">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" className="text-neutral-800 hover:text-primary font-medium text-sm">
                    My Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium text-sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            )}
            
            <div className="ml-3 md:hidden">
              <Button variant="ghost" onClick={toggleMobileMenu} className="inline-flex items-center justify-center p-2 text-neutral-800 hover:text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                link.active 
                  ? "text-primary border-l-4 border-primary bg-neutral-50" 
                  : "text-neutral-800 hover:text-primary border-l-4 border-transparent hover:border-primary hover:bg-neutral-50"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
