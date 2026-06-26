"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * App-wide client providers. Currently just TanStack Query (v5) for the account
 * panel's client-side data. QueryClientProvider is a context provider — it
 * renders children directly with no wrapper DOM node, so it does not affect the
 * root <body> flex layout. Children passed through still render as RSC.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
