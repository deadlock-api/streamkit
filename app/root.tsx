import type { LinksFunction } from "react-router";
import { Links, Outlet, Scripts, ScrollRestoration } from "react-router";

import "./tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/inter";
import interWoff2 from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: interWoff2,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
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
        <meta name="og:title" content="Deadlock API - Chat Command Builder - Widget Builder" />
        <meta name="og:description" content="Create custom Deadlock chat commands and widgets for your stream." />
        <meta name="og:url" content="https://streamkit.deadlock-api.com/" />
        <title>Deadlock API - Chat Command Builder and Widget Builder</title>
        <meta
          name="description"
          content="Create custom deadlock chat commands and widgets for your stream. Works with StreamElements, Fossabot, Nightbot, and more!"
        />
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
