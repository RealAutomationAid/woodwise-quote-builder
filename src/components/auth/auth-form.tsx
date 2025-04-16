
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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormProps = {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    // This would connect to a real authentication system
    console.log("Login attempt:", values);
    toast.success("Login successful!");
    if (onSuccess) onSuccess();
  }

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    // This would connect to a real registration system
    console.log("Register attempt:", values);
    toast.success("Registration successful! You can now log in.");
    setIsLogin(true);
  }

  function handleForgotPassword() {
    const email = loginForm.getValues("email");
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    // This would connect to a real password reset system
    console.log("Password reset request for:", email);
    toast.success("Password reset link sent to your email");
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
                    <Input placeholder="email@example.com" {...field} />
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
            <FormField
              control={registerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
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
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                className="text-sm text-woodwise-accent p-0"
                onClick={() => setIsLogin(false)}
              >
                Register here
              </Button>
            </div>
          </>
        ) : (
          <div>
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <Button 
              variant="link" 
              className="text-sm text-woodwise-accent p-0"
              onClick={() => setIsLogin(true)}
            >
              Login here
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
