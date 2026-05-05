'use client';

import Link from 'next/link';
import { Layers, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="bg-primary/10 p-2 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer">
              <Layers className="w-6 h-6 text-primary" />
            </div>
          </Link>
          <Link href="/">
            <span className="font-display font-bold text-xl cursor-pointer">DataPrep</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-border hover:bg-muted hover:border-primary/50 transition-all"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
            ) : (
              <Sun className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
