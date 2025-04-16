
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type MainHeaderProps = {
  quoteItemCount?: number;
};

export function MainHeader({ quoteItemCount = 0 }: MainHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-border bg-white sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <Logo />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/catalog" className="text-woodwise-text hover:text-primary transition-colors">
              Products
            </Link>
            {user && (
              <>
                <Link to="/quotes" className="text-woodwise-text hover:text-primary transition-colors">
                  My Quotes
                </Link>
                {isAdmin && (
                  <Link to="/admin/quotes" className="text-woodwise-text hover:text-primary transition-colors">
                    Client Quotes
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/quote" className="relative">
            <Button variant="ghost" size="icon" aria-label="View Quote">
              <ShoppingCart className="h-5 w-5" />
              {quoteItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {quoteItemCount}
                </span>
              )}
            </Button>
          </Link>
          
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/account">
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
            )}
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/catalog" 
                  className="text-xl py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/quotes" 
                      className="text-xl py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Quotes
                    </Link>
                    <Link 
                      to="/account" 
                      className="text-xl py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Account
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="flex justify-start px-0 hover:bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      <span className="text-xl">Logout</span>
                    </Button>
                  </>
                )}
                {!user && (
                  <Link 
                    to="/login" 
                    className="text-xl py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In / Register
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
