import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().nonempty("Email is required"),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().nonempty("Email is required"),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export interface AuthFormProps {
  isRegistration?: boolean;
}

export function AuthForm({ isRegistration = false }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(!isRegistration);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form state when toggling between login/register
  function handleToggleLogin(val: boolean) {
    setIsLogin(val);
    setTimeout(() => {
      loginForm.reset();
      registerForm.reset();
    }, 0);
  }

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    console.log('Login submit values:', values); // Debug log
    try {
      await signIn(values.email, values.password);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    console.log('Register submit values:', values); // Debug log
    try {
      const { data, error } = await signUp(
        values.email, 
        values.password,
        {
          first_name: values.firstName,
          last_name: values.lastName
        }
      );

      if (error) {
        console.error("Registration error:", error);
        if (error.message.includes("User already registered")) {
          toast.error("Този имейл адрес вече е регистриран. Моля опитайте с друг или използвайте формата за вход.");
        } else {
          toast.error(`Регистрацията не беше успешна: ${error.message}`);
        }
        return;
      }
      
      if (data?.user) {
        toast.success("Регистрацията е успешна! Сега ще бъдете пренасочени.");
        // Wait a bit before redirecting to ensure the toast is seen
        setTimeout(() => {
          navigate("/catalog");
        }, 1500);
      }
    } catch (error) {
      console.error("Signup execution error:", error);
      if (error instanceof Error) {
        toast.error(`Грешка: ${error.message}`);
      } else {
        toast.error("Възникна неочаквана грешка при регистрацията. Моля опитайте отново по-късно.");
      }
    }
  }

  function handleForgotPassword() {
    const email = loginForm.getValues("email");
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    
    resetPassword(email);
  }
  
  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset link");
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {isLogin ? "Login to Your Account" : "Create an Account"}
      </h2>
      
      {isLogin ? (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@example.com" 
                      type="email"
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Register
            </Button>
          </form>
        </Form>
      )}
      
      <div className="mt-6 text-center">
        {isLogin ? (
          <>
            <Button 
              variant="link" 
              className="text-sm text-woodwise-accent"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </Button>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Нямате акаунт? </span>
              <Link to="/signup" className="text-sm text-woodwise-accent hover:underline">
                Регистрирайте се сега
              </Link>
            </div>
          </>
        ) : (
          <div>
            <span className="text-sm text-muted-foreground">Вече имате акаунт? </span>
            <Button 
              variant="link" 
              className="text-sm text-woodwise-accent p-0"
              onClick={() => handleToggleLogin(true)}
            >
              Влезте тук
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
