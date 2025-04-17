import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu, ChevronDown, Package, ClipboardList, Tag, Settings, Home, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MainHeaderProps = {
  quoteItemCount?: number;
};

export function MainHeader({ quoteItemCount = 0 }: MainHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-30 w-full transition-all duration-200 ${
        scrolled 
          ? "bg-white border-b border-border shadow-sm" 
          : "bg-white border-b border-border"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center">
            <div className="h-10 w-10 mr-2 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Валекс Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-woodwise-text">Валекс</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-woodwise-text hover:text-woodwise-accent transition-colors rounded-md flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            
            <Link to="/catalog" className="px-3 py-2 text-woodwise-text hover:text-woodwise-accent transition-colors rounded-md flex items-center">
              <Package className="h-4 w-4 mr-1" />
              Products
            </Link>
            
            {user && (
              <Link to="/quotes" className="px-3 py-2 text-woodwise-text hover:text-woodwise-accent transition-colors rounded-md flex items-center">
                <ClipboardList className="h-4 w-4 mr-1" />
                My Quotes
              </Link>
            )}
            
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 text-woodwise-text hover:text-woodwise-accent transition-colors">
                    Admin
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/quotes" className="w-full flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Client Quotes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/categories" className="w-full flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Categories
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/products" className="w-full flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Products
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-1">
          <Link to="/quote" className="relative">
            <Button variant="ghost" size="icon" className="text-woodwise-text hover:text-woodwise-accent" aria-label="View Quote">
              <ShoppingCart className="h-5 w-5" />
              {quoteItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-woodwise-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {quoteItemCount}
                </span>
              )}
            </Button>
          </Link>
          
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center">
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="flex items-center text-woodwise-text hover:text-woodwise-accent px-3">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout} 
                  className="flex items-center text-woodwise-text hover:text-woodwise-accent px-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-woodwise-accent hover:bg-woodwise-brown text-white">
                  Log In
                </Button>
              </Link>
            )}
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-woodwise-text">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex items-center mt-4 mb-8">
                <div className="h-10 w-10 mr-2 overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Валекс Logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-woodwise-text">Валекс</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <Link 
                  to="/" 
                  className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span className="text-lg">Home</span>
                </Link>
                
                <Link 
                  to="/catalog" 
                  className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5 mr-3" />
                  <span className="text-lg">Products</span>
                </Link>
                
                <Link 
                  to="/quote" 
                  className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <span className="text-lg">Current Quote</span>
                  {quoteItemCount > 0 && (
                    <span className="ml-auto bg-woodwise-accent text-white text-xs min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                      {quoteItemCount}
                    </span>
                  )}
                </Link>
                
                {user && (
                  <>
                    <Link 
                      to="/quotes" 
                      className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ClipboardList className="h-5 w-5 mr-3" />
                      <span className="text-lg">My Quotes</span>
                    </Link>
                    
                    {isAdmin && (
                      <div className="mt-4 mb-2">
                        <p className="px-3 text-sm font-medium text-muted-foreground">Admin</p>
                        <Link 
                          to="/admin/quotes" 
                          className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ClipboardList className="h-5 w-5 mr-3" />
                          <span className="text-lg">Client Quotes</span>
                        </Link>
                        <Link 
                          to="/admin/categories" 
                          className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Tag className="h-5 w-5 mr-3" />
                          <span className="text-lg">Categories</span>
                        </Link>
                        <Link 
                          to="/admin/products" 
                          className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Package className="h-5 w-5 mr-3" />
                          <span className="text-lg">Products</span>
                        </Link>
                        <Link 
                          to="/admin/quotes" 
                          className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ShoppingBag className="h-5 w-5 mr-3" />
                          <span className="text-lg">Quotes</span>
                        </Link>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Link 
                        to="/account" 
                        className="px-3 py-2 rounded-md hover:bg-muted flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span className="text-lg">Account</span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-3 py-2 rounded-md hover:bg-muted"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="text-lg">Logout</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {!user && (
                  <div className="mt-4">
                    <Link 
                      to="/login" 
                      className="w-full px-4 py-2 bg-woodwise-accent hover:bg-woodwise-brown text-white rounded-md flex justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">Log In / Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
