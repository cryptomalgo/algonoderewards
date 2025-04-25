import { scan } from "react-scan"; // must be imported before React and React DOM

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
scan({
  enabled: true,
});

// Create a new router instance
const router = createRouter({ routeTree });
const queryClient = new QueryClient();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
