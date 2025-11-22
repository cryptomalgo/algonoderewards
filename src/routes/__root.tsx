import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import Footer from "@/components/footer.tsx";
import { Toaster } from "@/components/ui/sonner";
import { GithubCorner } from "@/components/github-corner";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

export const Route = createRootRoute({
  component: () => (
    <>
      <GithubCorner />
      <header className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-gray-200 lg:px-8">
        <div className="relative mr-auto flex h-16 justify-between">
          <div className="relative z-10 flex px-2 lg:px-0">
            <div className="flex flex-wrap items-center">
              <a
                href={"/"}
                className={
                  "text-foreground flex items-center gap-2 no-underline"
                }
              >
                <img
                  alt="Algo Node Rewards logo"
                  src="/logo.png"
                  width="32"
                  height="32"
                  className="h-8 w-auto"
                />
                <h1 className={"text-lg"}>Algo Node Rewards</h1>
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className={"flex-grow"}>
        <Outlet />
      </main>
      <Toaster />

      <Footer />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});
