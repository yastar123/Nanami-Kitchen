import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChefHat,
  Crown,
  Eye,
  EyeOff,
  LogOut,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import defaultLogo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Sign in to your Nanami Kitchen account with email and password to track orders, save addresses, and earn points.",
      },
      { property: "og:title", content: "Sign In — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Sign in with email and password to track orders and loyalty points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary transition";

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { profile, cms, settings } = useStore((s) => ({
    profile: s.profile,
    cms: s.cms,
    settings: s.settings,
  }));
  const displayLogo = cms?.logoUrl || defaultLogo;
  const storeName = settings?.storeName || "Nanami Kitchen";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleDirectRoute(role?: "user" | "admin" | "owner" | "staff") {
    if (role === "owner") {
      navigate({ to: redirect && redirect.startsWith("/owner") ? redirect : "/owner" });
    } else if (role === "admin" || role === "staff") {
      navigate({ to: redirect && redirect.startsWith("/admin") ? redirect : "/admin" });
    } else {
      navigate({
        to:
          redirect && !redirect.startsWith("/admin") && !redirect.startsWith("/owner")
            ? redirect
            : "/",
      });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await actions.signIn(email, password);
      if (!result.ok) {
        setError(result.error ?? "Invalid email or password. Please check your credentials.");
        return;
      }
      handleDirectRoute(result.role);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err?.message || "An unexpected error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (profile.signedIn) {
    const roleLabel =
      profile.role === "owner"
        ? "Owner"
        : profile.role === "admin"
          ? "Kitchen Admin"
          : profile.role === "staff"
            ? "Kitchen Staff"
            : "Customer";

    return (
      <AppShell hideCartBar hideBottomNav>
        <div className="mx-auto max-w-md py-12 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/30">
            {profile.role === "owner" ? (
              <Crown className="size-10" />
            ) : profile.role === "admin" ? (
              <ChefHat className="size-10" />
            ) : profile.role === "staff" ? (
              <UtensilsCrossed className="size-10" />
            ) : (
              <ShoppingBag className="size-10" />
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold">You are Already Signed In</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>{roleLabel}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {profile.name || profile.email}
          </p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => handleDirectRoute(profile.role)}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Continue to{" "}
              {profile.role === "owner"
                ? "Owner Dashboard"
                : profile.role === "admin" || profile.role === "staff"
                  ? "Admin Panel"
                  : "Storefront"}
            </button>
            <button
              onClick={() => {
                actions.signOut();
                setEmail("");
                setPassword("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/30 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition"
            >
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideCartBar hideBottomNav>
      <div className="mx-auto max-w-md pb-8 pt-4">
        <div className="text-center">
          <img
            src={displayLogo}
            alt={storeName}
            width={64}
            height={64}
            className="mx-auto size-16 rounded-2xl object-contain drop-shadow"
          />
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Sign In to {storeName}</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sign in to track orders, manage your saved addresses, and earn points. Guest Checkout is
            always supported.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
            >
              <Store className="size-3.5" /> Continue to Storefront as Guest
            </Link>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-medium text-foreground">
              Email Address
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@email.com"
                autoComplete="email"
                maxLength={255}
                required
                className={field}
              />
            </label>
            <label className="block text-xs font-medium text-foreground">
              Password
              <span className="relative block">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  maxLength={72}
                  required
                  className={`${field} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            {error && (
              <p className="rounded-xl bg-destructive/15 px-3.5 py-2.5 text-xs text-destructive font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="!mt-5 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-40"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link
            to="/register"
            reloadDocument
            className="font-semibold text-primary underline underline-offset-2"
          >
            Register New Account
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
