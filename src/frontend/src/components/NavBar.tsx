import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Loader2,
  LogOut,
  PlusCircle,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.home.link" },
  { to: "/create", label: "Create", icon: PlusCircle, ocid: "nav.create.link" },
  { to: "/profile", label: "Profile", icon: User, ocid: "nav.profile.link" },
] as const;

export default function NavBar() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          data-ocid="nav.logo.link"
        >
          <div className="relative">
            <img
              src="/assets/generated/talkie-logo-transparent.dim_80x80.png"
              alt="Talkie AI"
              className="w-8 h-8 object-contain"
            />
            <div className="absolute inset-0 blur-lg opacity-60 bg-primary rounded-full" />
          </div>
          <span className="font-display font-bold text-xl gradient-text tracking-tight hidden sm:block">
            Talkie AI
          </span>
        </Link>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon, ocid }) => {
            const isActive = pathname === to;
            return (
              <Link key={to} to={to} data-ocid={ocid}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Auth button */}
        <div className="shrink-0">
          {isInitializing ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="w-8 h-8 ring-2 ring-primary/40 cursor-pointer hover:ring-primary transition-all">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {identity
                      .getPrincipal()
                      .toString()
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive gap-1.5"
                data-ocid="nav.logout.button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 glow-primary"
                data-ocid="nav.login.button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>
          )}
        </div>
      </nav>
    </header>
  );
}
