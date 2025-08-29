'use client';

import React from 'react';
import AppShell from './AppShell';

/**
 * Higher-order component that wraps a page component with the AppShell
 * This ensures consistent navigation across all pages
 * 
 * @param Component The page component to wrap
 * @returns A new component wrapped with AppShell
 */
export default function withAppShell<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithAppShell: React.FC<P> = (props) => {
    return (
      <AppShell>
        <Component {...props} />
      </AppShell>
    );
  };

  // Set display name for debugging purposes
  const displayName = Component.displayName || Component.name || 'Component';
  WithAppShell.displayName = `withAppShell(${displayName})`;

  return WithAppShell;
}