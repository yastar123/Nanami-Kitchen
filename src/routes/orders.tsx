import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  actions,
  buildWhatsappMessage,
  cleanWhatsappNumber,
  getUserOrders,
  rupiah,
  useStore,
  type Order,
  type OrderStatus,
} from "@/lib/store";

const FLOW = ["Pending Payment", "Cooking", "Out for Delivery", "Completed"];
const PICKUP_FLOW = ["Pending Payment", "Cooking", "Ready for Pickup", "Completed"];

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order Tracking & History — Nanami Kitchen" },
      {
        name: "description",
        content: "Track your Nanami Kitchen order live from payment to cooking and delivery.",
      },
      { property: "og:title", content: "Order Tracking & History — Nanami Kitchen" },
      { property: "og:description", content: "Live status of your orders at Nanami Kitchen." },
    ],
  }),
  component: OrdersPage,
});

type StatusFilterType = "all" | "active" | "completed" | "cancelled";

function OrdersPage() {
  const rawOrders = useStore((s) => s.orders);
  const profile = useStore((s) => s.profile);

  const orders = useMemo(() => getUserOrders(rawOrders, profile), [rawOrders, profile]);

  // Live auto-refresh order status from server in real-time
  useEffect(() => {
    // Initial fetch on mount
    actions.loadServerState().catch(console.error);

    // Poll server every 3 seconds for live order status updates
    const interval = setInterval(() => {
      actions.loadServerState().catch(() => {});
    }, 3000);

    // Re-fetch immediately when tab regains focus or becomes visible
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        actions.loadServerState().catch(() => {});
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [search, setSearch] = useState("");

  // Load More state (initial 4 items)
  const INITIAL_COUNT = 4;
  const LOAD_INCREMENT = 4;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter === "active") {
        if (o.status === "Completed" || o.status === "Cancelled") return false;
      } else if (statusFilter === "completed") {
        if (o.status !== "Completed") return false;
      } else if (statusFilter === "cancelled") {
        if (o.status !== "Cancelled") return false;
      }

      // Type filter
      if (typeFilter !== "all" && o.type !== typeFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchCode = o.code.toLowerCase().includes(q);
        const matchItems = o.lines.some((l) => l.name.toLowerCase().includes(q));
        const matchCustomer = (o.customer.name || "").toLowerCase().includes(q);
        if (!matchCode && !matchItems && !matchCustomer) return false;
      }

      return true;
    });
  }, [orders, statusFilter, typeFilter, search]);

  const visibleOrders = useMemo(() => {
    return filteredOrders.slice(0, visibleCount);
  }, [filteredOrders, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_INCREMENT);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearch("");
    setVisibleCount(INITIAL_COUNT);
  };

  // Metrics
  const activeCount = orders.filter(
    (o) => o.status !== "Completed" && o.status !== "Cancelled",
  ).length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  return (
    <AppShell hideCartBar>
      <div className="space-y-4 pb-12">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Order History</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track live order progress and transaction history
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
          >
            <Sparkles className="size-3.5" /> Order New Items
          </Link>
        </div>

        {/* Filter Section */}
        <div className="glow-card p-3.5 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              placeholder="Search order ID or menu item..."
              className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("active");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Processing ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("completed");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("cancelled");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === "cancelled"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Cancelled
              </button>
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as "all" | "delivery" | "pickup");
                  setVisibleCount(INITIAL_COUNT);
                }}
                className="rounded-lg border border-input bg-secondary/40 px-2.5 py-1 text-[11px] font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="py-16 text-center rounded-2xl border border-dashed border-border p-6">
            <Package className="mx-auto size-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search query or order status filter."
                : "You don't have any order history yet."}
            </p>
            {(search || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary/40 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Order Cards List */}
        <div className="space-y-3.5">
          {visibleOrders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>

        {/* Load More Button & Pagination Info */}
        {filteredOrders.length > 0 && (
          <div className="pt-2 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{visibleOrders.length}</span> of{" "}
              <span className="font-bold text-foreground">{filteredOrders.length}</span> orders
            </p>

            {visibleOrders.length < filteredOrders.length ? (
              <button
                type="button"
                onClick={handleLoadMore}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border px-6 py-2.5 text-xs font-bold text-foreground transition-all shadow-xs hover:shadow cursor-pointer active:scale-95"
              >
                <ArrowDown className="size-3.5 text-primary" />
                <span>Load More ({filteredOrders.length - visibleOrders.length} remaining)</span>
              </button>
            ) : (
              <p className="text-[11px] text-muted-foreground/80 italic">
                All orders are displayed
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function OrderCard({ order }: { order: Order }) {
  const settings = useStore((s) => s.settings);
  const flow = order.type === "delivery" ? FLOW : PICKUP_FLOW;
  const index = flow.indexOf(order.status);
  const targetWa = cleanWhatsappNumber(settings.whatsapp);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending Payment":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      case "Cooking":
        return "bg-blue-500/15 text-blue-600 border-blue-500/30";
      case "Ready for Pickup":
      case "Out for Delivery":
        return "bg-purple-500/15 text-purple-600 border-purple-500/30";
      case "Completed":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "Cancelled":
        return "bg-rose-500/15 text-rose-600 border-rose-500/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <article className="glow-card p-4 transition hover:shadow-md border border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground">{order.code}</span>
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                order.type === "delivery"
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {order.type === "delivery" ? (
                <Truck className="size-2.5" />
              ) : (
                <ShoppingBag className="size-2.5" />
              )}
              {order.type === "delivery" ? "Delivery" : "Pickup"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="size-3" />
            {new Date(order.createdAt).toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
              order.status,
            )}`}
          >
            {order.status}
          </span>
          <button
            aria-label="Send to WhatsApp Owner"
            onClick={() =>
              window.open(
                `https://wa.me/${targetWa}?text=${encodeURIComponent(
                  buildWhatsappMessage(order, settings),
                )}`,
                "_blank",
              )
            }
            className="flex items-center gap-1 rounded-xl bg-wa/15 px-2.5 py-1 text-xs font-bold text-wa hover:bg-wa/25 transition cursor-pointer"
          >
            <MessageSquare className="size-3" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Flow Steps Indicator */}
      {order.status === "Cancelled" ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive">
          <XCircle className="size-4" /> Order has been cancelled
        </div>
      ) : order.status === "Completed" ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="size-4" /> Order completed and delivered
        </div>
      ) : (
        <div className="mt-3 py-1">
          <ol className="flex items-center justify-between gap-1">
            {flow.map((step, i) => {
              const isCurrent = i === index;
              const isPast = i < index;
              return (
                <li key={step} className="flex-1 text-center">
                  <div className="flex items-center">
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        i === 0 ? "invisible" : isPast || isCurrent ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <div
                      className={`size-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isPast
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        i === flow.length - 1 ? "invisible" : isPast ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  </div>
                  <p
                    className={`mt-1 text-[10px] leading-tight truncate px-0.5 ${
                      isCurrent
                        ? "font-bold text-primary"
                        : isPast
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Items Summary & Price Breakdown */}
      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        {(order.lines || []).map((l) => (
          <div key={l.id} className="flex items-start justify-between gap-2">
            <p className="text-foreground/90 font-medium">
              <span className="font-bold text-foreground">{l.qty}x</span> {l.name}
              {l.optionLabels && l.optionLabels.length ? (
                <span className="text-[11px] text-muted-foreground block">
                  ({l.optionLabels.join(", ")})
                </span>
              ) : null}
            </p>
            <span className="font-mono text-muted-foreground shrink-0">
              {rupiah(l.unitPrice * l.qty)}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-bold text-foreground">
          <span className="text-muted-foreground">
            Total Amount ({order.paymentMethod || "eWallet"}):
          </span>
          <span className="font-mono text-sm text-primary">{rupiah(order.total)}</span>
        </div>
      </div>
    </article>
  );
}
