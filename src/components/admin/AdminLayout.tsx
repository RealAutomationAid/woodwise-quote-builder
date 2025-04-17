import { useNavigate, Link, useLocation } from "react-router-dom";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag, LayoutDashboard, Settings, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null;
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      isActive: location.pathname === "/admin"
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <Package className="mr-2 h-4 w-4" />,
      isActive: location.pathname === "/admin/products"
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <Tags className="mr-2 h-4 w-4" />,
      isActive: location.pathname === "/admin/categories"
    },
    {
      name: "Quotes",
      href: "/admin/quotes",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
      isActive: location.pathname === "/admin/quotes"
    }
  ];
  
  // Remove legacy page redirects to fix the navigation
  // Legacy page redirects
  // const legacyPages = {
  //   "/admin/products": "/admin/product-management",
  //   "/admin/categories": "/admin/product-management"
  // };
  
  // useEffect(() => {
  //   const currentPath = location.pathname;
  //   if (legacyPages[currentPath as keyof typeof legacyPages]) {
  //     navigate(legacyPages[currentPath as keyof typeof legacyPages], { replace: true });
  //   }
  // }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainHeader />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 hidden md:block">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">Admin Panel</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage your store</p>
            <Separator className="my-4" />
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    item.isActive ? "bg-secondary" : ""
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    {item.icon}
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <MainFooter />
    </div>
  );
}
