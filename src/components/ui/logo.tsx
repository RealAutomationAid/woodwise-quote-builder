import { cn } from "@/lib/utils";
import { LucideLogIn } from "lucide-react";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)}>
      <div className="bg-primary h-8 w-8 rounded flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-xl">В</span>
      </div>
      <span className="text-xl text-woodwise-text">Валекс</span>
    </div>
  );
};
