'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 30 seconds
            staleTime: 30 * 1000,
            // Retry once on failure
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry once on mutation failure
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
