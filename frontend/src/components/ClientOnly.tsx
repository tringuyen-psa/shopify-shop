'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Remove browser extension classes that cause hydration mismatches
    const html = document.documentElement;
    const extensionClasses = ['mdl-js', 'chrome-ext', 'firefox-ext', 'ext-'];

    // Remove extension classes
    extensionClasses.forEach(cls => {
      if (html.classList.contains(cls)) {
        html.classList.remove(cls);
      }
    });

    // Remove any classes that start with common extension prefixes
    const classesToRemove: string[] = [];
    for (let i = 0; i < html.classList.length; i++) {
      const className = html.classList[i];
      if (className && (
        className.startsWith('mdl-') ||
        className.startsWith('chrome-') ||
        className.startsWith('firefox-') ||
        className.startsWith('ext-')
      )) {
        classesToRemove.push(className);
      }
    }
    classesToRemove.forEach(cls => html.classList.remove(cls));

    // Hide extension overlays
    const extensionElements = document.querySelectorAll(
      'div[id^="crx-"], div[id^="extension-"], div[data-extension], [class*="browser-extension"]'
    );
    extensionElements.forEach(el => {
      if (el instanceof HTMLElement) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}