'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState, type ReactNode } from 'react';

/**
 * Client-side providers, isolated here so the root layout can stay a Server
 * Component.
 *
 * `NuqsAdapter` is mandatory: without it nuqs throws "requires an adapter to
 * work with your framework" at the first `useQueryStates` call.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Created in state rather than at module scope so that each browser session
  // gets its own cache, and so a server render never shares a client between
  // requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // The catalogue changes rarely; this avoids a refetch storm when
            // the user tabs back and forth.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
