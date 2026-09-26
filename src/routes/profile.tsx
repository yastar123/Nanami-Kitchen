import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  CircleHelp,
  KeyRound,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Nanami Kitchen" },
      { name: "description", content: "Manage your Nanami Kitchen account, orders, and settings." },
      { property: "og:title", content: "Profile — Nanami Kitchen" },
      { property: "og:description", content: "Manage your account, orders, and settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { profile, orders, settings } = useStore((s) => ({
    profile: s.profile,
    orders: s.orders,
    settings: s.settings,
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");

  const initials =
    (profile.name || "")
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "NK";

  const field =
    "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";

  if (!profile.signedIn) {
    return (
      <AppShell hideCartBar>
        <h1 className="mt-6 text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to save your addresses, follow your orders and collect loyalty points.
        </p>
        <Link
          to="/login"
          className="mt-6 block rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="mt-3 block rounded-full border border-border py-3.5 text-center text-sm font-semibold"
        >
          Create account
        </Link>
        <Link
          to="/orders"
          className="mt-3 block rounded-full border border-border py-3.5 text-center text-sm font-semibold"
        >
          Continue as guest
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell hideCartBar>
      <div className="mt-6 flex w-full items-center gap-4 text-left">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground ring-2 ring-border">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold">{profile.name || "Guest"}</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary capitalize">
              {profile.role ?? "user"}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{profile.email}</p>
          <p className="truncate text-sm text-muted-foreground">{profile.phone}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="glow-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Loyalty Points
          </p>
          <p className="mt-1 text-xl font-bold">{profile.points}</p>
          <p className="text-xs text-muted-foreground">
            {settings.pointsPer10k} point per {settings.currencySymbol || "N$"} 100
          </p>
        </div>
        <div className="glow-card p-4">
          <p className="text-xs text-muted-foreground">Orders Placed</p>
          <p className="mt-1 text-xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">All Time</p>
        </div>
      </div>

      <div className="glow-card mt-6 divide-y divide-border overflow-hidden">
        <Row to="/orders" icon={Package} label="My Orders" />
        <Row to="/saved-address" icon={MapPin} label="Saved Addresses" />
        <Row to="/vouchers" icon={TicketPercent} label="Vouchers & Promos" />
        <button
          onClick={() => setShowPassword((v) => !v)}
          className="flex w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-secondary/60"
        >
          <KeyRound className="size-5 sm:size-6 shrink-0 text-muted-foreground" strokeWidth={1.8} />
          <span className="flex-1 text-sm sm:text-base font-medium">Change Password</span>
          <ChevronRight className="size-4 sm:size-5 text-muted-foreground shrink-0" />
        </button>
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-secondary/60"
        >
          <MessageCircle
            className="size-5 sm:size-6 shrink-0 text-muted-foreground"
            strokeWidth={1.8}
          />
          <span className="flex-1 text-sm sm:text-base font-medium">Chat With Us</span>
          <ChevronRight className="size-4 sm:size-5 text-muted-foreground shrink-0" />
        </a>
        <div className="flex w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 text-left">
          <CircleHelp
            className="size-5 sm:size-6 shrink-0 text-muted-foreground"
            strokeWidth={1.8}
          />
          <span className="flex-1 text-xs sm:text-sm text-muted-foreground">
            Open {settings.openHours}. Delivery up to {settings.maxRadiusKm} km.
          </span>
        </div>
      </div>

      {showPassword && (
        <div className="glow-card mt-4 space-y-3 p-4">
          <h2 className="text-sm font-semibold">Change Password</h2>
          <label className="block text-xs text-muted-foreground">
            Current Password
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={field}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            New Password
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={field}
            />
          </label>
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
          <button
            onClick={() => {
              const result = actions.changePassword(current, next);
              setMessage(result.ok ? "Password updated." : (result.error ?? "Failed."));
              if (result.ok) {
                setCurrent("");
                setNext("");
              }
            }}
            disabled={!current || !next}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Update Password
          </button>
        </div>
      )}

      <button
        onClick={() => {
          actions.signOut();
          navigate({ to: "/login", replace: true });
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-semibold"
      >
        <LogOut className="size-4" /> Sign Out
      </button>
    </AppShell>
  );
}

function Row({ to, icon: Icon, label }: { to: string; icon: typeof Package; label: string }) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-secondary/60"
    >
      <Icon className="size-5 sm:size-6 shrink-0 text-muted-foreground" strokeWidth={1.8} />
      <span className="flex-1 text-sm sm:text-base font-medium">{label}</span>
      <ChevronRight className="size-4 sm:size-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
