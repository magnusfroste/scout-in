import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                James 1100
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Saves your time by bringing actionable insights ... 
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Search className="h-4 w-4 mr-2" />
            Quick Search
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}