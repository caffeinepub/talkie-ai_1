import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import NavBar from "./components/NavBar";
import ChatPage from "./pages/ChatPage";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$characterId",
  component: ChatPage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreatePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  createRoute_,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="py-6 px-4 text-center text-muted-foreground text-sm border-t border-border/30 mt-auto">
      <p>
        © {year}. Built with <span className="text-destructive">♥</span> using{" "}
        <a
          href={utmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-accent transition-colors underline underline-offset-2"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}

// Re-export router utilities for use in components
export { Link, useNavigate, useParams };
