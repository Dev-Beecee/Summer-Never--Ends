"use client";

import { ReglageSiteProvider } from "@/hooks/useReglageSite";
import { AuthProvider } from '@/hooks/useAuth';
import { ReglageSiteStyleProvider } from '@/components/ReglageSiteStyleProvider';
import { ReglageSiteStyles } from '@/components/ReglageSiteStyles';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReglageSiteProvider>
      <AuthProvider>
        <ReglageSiteStyleProvider>
          <ReglageSiteStyles />
          {children}
        </ReglageSiteStyleProvider>
      </AuthProvider>
    </ReglageSiteProvider>
  );
} 