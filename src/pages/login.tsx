
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { AuthForm } from "@/components/auth/auth-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/catalog");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthForm />
      </div>
      
      <MainFooter />
    </div>
  );
};

export default LoginPage;
