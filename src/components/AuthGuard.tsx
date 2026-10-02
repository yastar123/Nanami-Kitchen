import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChefHat,
  Crown,
  Loader2,
  LogIn,
  ShieldAlert,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { actions, useStore } from "@/lib/store";
import { getSessionToken } from "@/lib/session";

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/auth"];

function isCustomerRestrictedPath(pathname: string): boolean {
  return (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/saved-address" ||
    pathname.startsWith("/saved-address/")
  );
}

function isOperationalAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/orders" ||
    pathname.startsWith("/admin/orders/") ||
    pathname === "/admin/stock" ||
    pathname.startsWith("/admin/stock/")
  );
}

function isOwnerOnlyAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/menu" ||
    pathname.startsWith("/admin/menu/") ||
    pathname === "/admin/media" ||
    pathname.startsWith("/admin/media/") ||
    pathname === "/admin/customers" ||
    pathname.startsWith("/admin/customers/") ||
    pathname === "/admin/reports" ||
    pathname.startsWith("/admin/reports/") ||
    pathname === "/admin/settings" ||
    pathname.startsWith("/admin/settings/")
  );
}

function isStaffOrAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isOwnerPath(pathname: string): boolean {
  return pathname === "/owner" || pathname.startsWith("/owner/");
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [mounted, setMounted] = useState(false);

  const isAuthPage = PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isOwnerArea = isOwnerPath(pathname);
  const isAdminArea = isStaffOrAdminPath(pathname);
  const isCustomerMemberArea = isCustomerRestrictedPath(pathname);

  useEffect(() => {
    setMounted(true);

    if (isAuthPage) return;

    // Handle legacy admin redirects for Owner
    if (isAdminArea && profile.signedIn && profile.role === "owner") {
      if (isOwnerOnlyAdminPath(pathname)) {
        if (pathname === "/admin/menu" || pathname.startsWith("/admin/menu/")) {
          navigate({ to: "/owner/menu", replace: true });
          return;
        }
        if (pathname === "/admin/media" || pathname.startsWith("/admin/media/")) {
          navigate({ to: "/owner/media", replace: true });
          return;
        }
        if (pathname === "/admin/customers" || pathname.startsWith("/admin/customers/")) {
          navigate({ to: "/owner/customers", replace: true });
          return;
        }
        if (pathname === "/admin/reports" || pathname.startsWith("/admin/reports/")) {
          navigate({ to: "/owner/finance", replace: true });
          return;
        }
        if (pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) {
          navigate({ to: "/owner/settings", replace: true });
          return;
        }
      }
    }
  }, [isAuthPage, isAdminArea, profile.signedIn, profile.role, pathname, navigate]);

  // If visiting login, register or auth, allow immediately
  if (isAuthPage) {
    return <>{children}</>;
  }

  // During SSR or initial client hydration (!mounted), always render children (<Outlet />)
  if (!mounted) {
    return <>{children}</>;
  }

  // Check if session cookie exists but profile state is re-hydrating on refresh
  const hasSessionToken = Boolean(getSessionToken());
  if (hasSessionToken && !profile.signedIn) {
    // Wait for session re-hydration without forcing redirects
    return <>{children}</>;
  }

  // 1. Check Owner access (strictly owner only)
  if (isOwnerArea) {
    if (!profile.signedIn) {
      return <UnauthenticatedGate pathname={pathname} title="Owner Portal Access" />;
    }
    if (profile.role !== "owner") {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "user"}
          message="Executive financials, staff assignments, and store settings are restricted to Owner access."
        />
      );
    }
  }

  // 2. Check Admin / Staff access
  if (isAdminArea) {
    if (!profile.signedIn) {
      return <UnauthenticatedGate pathname={pathname} title="Kitchen & Admin Portal Access" />;
    }
    if (profile.role === "user") {
      return <RoleUnauthorizedGate requiredRole="admin" currentRole="user" />;
    }

    // Granular protection: owner-only tools inside admin
    if (isOwnerOnlyAdminPath(pathname) && profile.role !== "owner") {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "admin"}
          message="Catalog CRUD, Media Library, Customers, Financial Reports, and Store Settings are restricted to Owner role only."
        />
      );
    }

    // Protection for staff and admin roles:
    if (
      (profile.role === "staff" || profile.role === "admin") &&
      !isOperationalAdminPath(pathname)
    ) {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "admin"}
          message="This page requires Owner privileges. Kitchen Admin and Staff have access to the Kitchen Board, Order Management, and Stock Availability."
        />
      );
    }
  }

  // 3. Check Customer member-only pages
  if (isCustomerMemberArea && !profile.signedIn) {
    return <UnauthenticatedGate pathname={pathname} title="Member Account Required" />;
  }

  // All other storefront routes (/, /menu, /cart, /checkout, /order-success, /tracking, /address, /vouchers) are 100% public
  return <>{children}</>;
}

function UnauthenticatedGate({ pathname, title }: { pathname: string; title?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <img src={logo} alt="Nanami Kitchen" width={64} height={64} className="mx-auto size-16" />
        <h2 className="mt-4 text-xl font-bold">{title || "Please Sign In First"}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Sign in to access your saved profile and loyalty account, or explore our menu as a guest.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {pathname && pathname !== "/" ? (
            <Link
              to="/login"
              search={{ redirect: pathname }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <LogIn className="size-4" /> Sign In Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <LogIn className="size-4" /> Sign In Now
            </Link>
          )}
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            <Store className="size-3.5" /> Continue as Guest (Storefront)
          </Link>
          <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground pt-1">
            Don&apos;t have an account? Register
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Or Quick Switch Demo Account:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => {
                actions.loginAsDemo("user");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60 cursor-pointer"
            >
              <ShoppingBag className="size-4 text-primary" />
              <span className="text-[11px] font-bold">User</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("staff");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60 cursor-pointer"
            >
              <UtensilsCrossed className="size-4 text-blue-500" />
              <span className="text-[11px] font-bold">Staff</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("admin");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60 cursor-pointer"
            >
              <ChefHat className="size-4 text-amber-500" />
              <span className="text-[11px] font-bold">Admin</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("owner");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60 cursor-pointer"
            >
              <Crown className="size-4 text-purple-500" />
              <span className="text-[11px] font-bold">Owner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleUnauthorizedGate({
  requiredRole,
  currentRole,
  message,
}: {
  requiredRole: string;
  currentRole: string;
  message?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Access Restricted ({requiredRole.toUpperCase()})</h2>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {message ||
            `Your account role (${currentRole.toUpperCase()}) does not have permission to view this module.`}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {currentRole === "owner" ? (
            <Link
              to="/owner"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              Return to Owner Dashboard
            </Link>
          ) : currentRole === "admin" || currentRole === "staff" ? (
            <Link
              to="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              Return to Kitchen Board
            </Link>
          ) : (
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              Return to Storefront
            </Link>
          )}

          <button
            onClick={() => {
              actions.signOut();
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary/70 hover:text-foreground cursor-pointer"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
