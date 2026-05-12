'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/use-theme';
import { AuthProvider } from '@/app/contexts/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
