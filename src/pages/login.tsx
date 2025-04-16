
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { AuthForm } from "@/components/auth/auth-form";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // This would connect to a real authentication system
    navigate("/catalog");
  };

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthForm onSuccess={handleLoginSuccess} />
      </div>
      
      <MainFooter />
    </div>
  );
};

export default LoginPage;
