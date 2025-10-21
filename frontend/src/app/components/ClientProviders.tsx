'use client';

import { useEffect } from 'react';
import { AuthProvider } from "@/lib/auth/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove browser extension classes that cause hydration mismatches
    const html = document.documentElement;

    // Remove common browser extension classes
    const extensionClasses = ['mdl-js'];
    extensionClasses.forEach(cls => {
      if (html.classList.contains(cls)) {
        html.classList.remove(cls);
      }
    });

    // Remove any other classes that start with common extension prefixes
    const classesToRemove: string[] = [];
    for (let i = 0; i < html.classList.length; i++) {
      const className = html.classList[i];
      if (className && className.startsWith('mdl-')) {
        classesToRemove.push(className);
      }
    }
    classesToRemove.forEach(cls => html.classList.remove(cls));

    // Hide extension overlays that interfere with hydration
    const extensionElements = document.querySelectorAll(
      'div[id^="crx-"], div[id^="extension-"], div[data-extension], [class*="browser-extension"]'
    );
    extensionElements.forEach(el => {
      if (el instanceof HTMLElement) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
}