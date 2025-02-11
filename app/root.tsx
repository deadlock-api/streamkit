import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import "./tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wdth,wght@0,75..100,100..900;1,75..100,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="deadlock api, deadlock streamkit, deadlock chat commands, deadlock widget, deadlock overlay"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Deadlock API" />
        <meta name="og:title" content="Deadlock API - Streamkit" />
        <meta name="og:description" content="Create custom Deadlock chat commands and widgets for your stream." />
        <meta name="og:url" content="https://streamkit.deadlock-api.com/" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 100,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function HydrateFallback() {
  return <div />;
}
