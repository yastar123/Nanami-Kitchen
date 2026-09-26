import { Link, useLocation } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag, Package, User } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const cart = useStore((s) => s.cart);
  const { items: count } = cartTotals(cart);
  const { pathname } = useLocation();

  return (
    <nav
      suppressHydrationWarning
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-md border-t border-border/80 bg-popover/95 backdrop-blur-md sm:border-x sm:border-border/40"
    >
      <div className="w-full grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              suppressHydrationWarning
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {to === "/cart" && count > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
