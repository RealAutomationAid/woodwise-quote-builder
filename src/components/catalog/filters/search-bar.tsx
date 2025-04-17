import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Implement keyboard shortcut for search (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`relative rounded-md border bg-background transition-colors ${
        focused ? "ring-1 ring-ring" : ""
      }`}
    >
      <div className="flex items-center">
        <div className="pointer-events-none absolute flex h-full items-center justify-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          ref={inputRef}
          placeholder="Search products..."
          className="pl-9 pr-12 py-2 h-10 border-0 shadow-none focus-visible:ring-0 rounded-md"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 rounded-full p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      {focused && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      )}
    </div>
  );
} 