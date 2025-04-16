
import { useNavigate } from "react-router-dom";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      <div className="flex-1 container mx-auto px-4 py-6">
        {children}
      </div>
      <MainFooter />
    </div>
  );
}
