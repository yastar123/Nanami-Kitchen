import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  actions,
  cleanWhatsappNumber,
  formatCurrency,
  rupiah,
  useStore,
  type Order,
  type OrderStatus,
} from "@/lib/store";
import { StatCard } from "./DashboardShell";
import { DailyOrdersPanel } from "./DailyOrdersPanel";

type StatusTabKey = "all" | "pending" | "cooking" | "ready" | "completed" | "cancelled";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending Payment",
  "Cooking",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Cancelled",
];

function getStatusBadgeClass(status: OrderStatus) {
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
}

function getNextStatusAction(order: Order): { label: string; nextStatus: OrderStatus } | null {
  switch (order.status) {
    case "Pending Payment":
      return { label: "Accept & Cook", nextStatus: "Cooking" };
    case "Cooking":
      return order.type === "delivery"
        ? { label: "Out for Delivery", nextStatus: "Out for Delivery" }
        : { label: "Ready for Pickup", nextStatus: "Ready for Pickup" };
    case "Ready for Pickup":
    case "Out for Delivery":
      return { label: "Mark Completed", nextStatus: "Completed" };
    default:
      return null;
  }
}

function formatRelativeTime(timestamp: number) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function OrderManagementPanel() {
  const orders = useStore((s) => s.orders);
  const [activeTab, setActiveTab] = useState<StatusTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest">("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"pipeline" | "recap">("pipeline");

  // Status Counts
  const counts = useMemo(() => {
    let pending = 0;
    let cooking = 0;
    let ready = 0;
    let completed = 0;
    let cancelled = 0;

    for (const o of orders) {
      if (o.status === "Pending Payment") pending++;
      else if (o.status === "Cooking") cooking++;
      else if (o.status === "Ready for Pickup" || o.status === "Out for Delivery") ready++;
      else if (o.status === "Completed") completed++;
      else if (o.status === "Cancelled") cancelled++;
    }

    return {
      all: orders.length,
      pending,
      cooking,
      ready,
      completed,
      cancelled,
    };
  }, [orders]);

  // Overall stats
  const totalRevenue = useMemo(() => {
    return orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const todayRevenue = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return orders
      .filter((o) => o.createdAt >= todayStart.getTime() && o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart.getTime() - 86400000;
    const weekStart = todayStart.getTime() - 7 * 86400000;

    return orders
      .filter((o) => {
        // Tab status filter
        if (activeTab === "pending" && o.status !== "Pending Payment") return false;
        if (activeTab === "cooking" && o.status !== "Cooking") return false;
        if (
          activeTab === "ready" &&
          o.status !== "Ready for Pickup" &&
          o.status !== "Out for Delivery"
        )
          return false;
        if (activeTab === "completed" && o.status !== "Completed") return false;
        if (activeTab === "cancelled" && o.status !== "Cancelled") return false;

        // Type filter
        if (typeFilter !== "all" && o.type !== typeFilter) return false;

        // Date filter
        if (dateFilter === "today" && o.createdAt < todayStart.getTime()) return false;
        if (
          dateFilter === "yesterday" &&
          (o.createdAt < yesterdayStart || o.createdAt >= todayStart.getTime())
        )
          return false;
        if (dateFilter === "week" && o.createdAt < weekStart) return false;

        // Search Query (code, customer name, phone, item name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCode = o.code.toLowerCase().includes(q);
          const matchName = (o.customer.name || "").toLowerCase().includes(q);
          const matchPhone = (o.customer.phone || "").toLowerCase().includes(q);
          const matchItems = o.lines.some((l) => l.name.toLowerCase().includes(q));
          if (!matchCode && !matchName && !matchPhone && !matchItems) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") return b.createdAt - a.createdAt;
        if (sortOrder === "oldest") return a.createdAt - b.createdAt;
        if (sortOrder === "highest") return b.total - a.total;
        return 0;
      });
  }, [orders, activeTab, typeFilter, dateFilter, searchQuery, sortOrder]);

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    actions.setOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: newStatus, paid: prev.paid || newStatus !== "Pending Payment" }
          : null,
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Orders"
          value={String(counts.all)}
          hint={`${orders.filter((o) => o.type === "delivery").length} Delivery · ${orders.filter((o) => o.type === "pickup").length} Pickup`}
        />
        <StatCard
          label="Pending Payment"
          value={String(counts.pending)}
          hint="Needs confirmation"
        />
        <StatCard label="Cooking" value={String(counts.cooking)} hint="In kitchen" />
        <StatCard
          label="Ready / In Transit"
          value={String(counts.ready)}
          hint="Waiting pickup/driver"
        />
        <StatCard label="Completed" value={String(counts.completed)} hint="Fulfilled" />
        <StatCard
          label="Total Revenue"
          value={rupiah(totalRevenue)}
          hint={`Today: ${rupiah(todayRevenue)}`}
        />
      </div>

      {/* View Mode Toggle Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1 shadow-xs">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === "pipeline"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Orders Table ({orders.length})</span>
          </button>
          <button
            onClick={() => setViewMode("recap")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === "recap"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>7-Day Sales Recap</span>
          </button>
        </div>
      </div>

      {viewMode === "recap" ? (
        <DailyOrdersPanel />
      ) : (
        /* Main Container */
        <div className="rounded-3xl border border-border bg-card shadow-sm">
          {/* Status Pipeline Tabs */}
          <div className="border-b border-border px-4 pt-3 sm:px-6">
            <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-none">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>All Orders</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "all"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("pending")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "pending"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Clock className="size-3.5" />
                <span>Pending Payment</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "pending"
                      ? "bg-white/25 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.pending}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("cooking")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "cooking"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Flame className="size-3.5" />
                <span>Cooking</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "cooking"
                      ? "bg-white/25 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.cooking}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ready")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "ready"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Package className="size-3.5" />
                <span>Ready / Out for Delivery</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "ready"
                      ? "bg-white/25 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.ready}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("completed")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "completed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                <span>Completed</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "completed"
                      ? "bg-white/25 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.completed}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("cancelled")}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === "cancelled"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <X className="size-3.5" />
                <span>Cancelled</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    activeTab === "cancelled"
                      ? "bg-white/25 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts.cancelled}
                </span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, customer, phone, item..."
                className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-9 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Select Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Order Type */}
              <div className="flex items-center rounded-xl border border-border bg-secondary/40 p-1">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    typeFilter === "all"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter("delivery")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    typeFilter === "delivery"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  <Truck className="size-3" /> Delivery
                </button>
                <button
                  onClick={() => setTypeFilter("pickup")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    typeFilter === "pickup"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  <ShoppingBag className="size-3" /> Pickup
                </button>
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value as "all" | "today" | "yesterday" | "week")
                }
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Past 7 Days</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "highest")}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
              </select>
            </div>
          </div>

          {/* Orders Table (Desktop) & Cards (Mobile) */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground">
                <FileText className="size-7" />
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">No orders found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery
                  ? `No orders matching "${searchQuery}". Try clearing search or filters.`
                  : "There are currently no orders in this status category."}
              </p>
              {(searchQuery || typeFilter !== "all" || dateFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                    setDateFilter("all");
                  }}
                  className="mt-4 rounded-full border border-border bg-secondary/50 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-3">Order & Time</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items & Notes</th>
                      <th className="px-4 py-3">Total & Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => {
                      const nextAction = getNextStatusAction(order);
                      const totalQty = order.lines.reduce((s, l) => s + l.qty, 0);
                      const hasSpecialRequest = order.lines.some((l) => Boolean(l.note));

                      return (
                        <tr key={order.id} className="transition hover:bg-secondary/15">
                          {/* Order & Time */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-foreground">
                                  {order.code}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
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
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="size-3" />
                                <span>
                                  {new Date(order.createdAt).toLocaleTimeString("en-ZA", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span>&bull;</span>
                                <span>{formatRelativeTime(order.createdAt)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">
                                  {order.customer.name || "Guest Customer"}
                                </span>
                                {order.accountId ? (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                                    Member
                                  </span>
                                ) : (
                                  <span className="rounded bg-secondary px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground">
                                    Guest
                                  </span>
                                )}
                              </div>
                              {order.customer.phone && (
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Phone className="size-2.5" />
                                  <span>{order.customer.phone}</span>
                                  <a
                                    href={`https://wa.me/${cleanWhatsappNumber(order.customer.phone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Chat on WhatsApp"
                                    className="text-emerald-600 hover:text-emerald-700 ml-1"
                                  >
                                    <MessageSquare className="size-3" />
                                  </a>
                                </div>
                              )}
                              {order.type === "delivery" && order.customer.address && (
                                <p className="max-w-[200px] truncate text-[11px] text-muted-foreground">
                                  {order.customer.address}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Items & Notes */}
                          <td className="px-4 py-4 align-top max-w-[280px]">
                            <div className="space-y-1.5">
                              <div className="text-xs font-medium text-foreground">
                                {(order.lines || []).map((l, idx) => (
                                  <div key={idx} className="leading-tight mb-1">
                                    <span className="font-bold text-primary">{l.qty}x</span>{" "}
                                    <span>{l.name}</span>
                                    {l.optionLabels && l.optionLabels.length > 0 && (
                                      <span className="text-[10px] text-muted-foreground block pl-4">
                                        ({l.optionLabels.join(", ")})
                                      </span>
                                    )}
                                    {l.note && (
                                      <div className="mt-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                                        &ldquo;{l.note}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {totalQty} item{totalQty > 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>

                          {/* Total & Payment */}
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <p className="font-mono text-xs font-bold text-foreground">
                                {rupiah(order.total)}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                    order.paid
                                      ? "bg-emerald-500/15 text-emerald-600"
                                      : "bg-amber-500/15 text-amber-600"
                                  }`}
                                >
                                  {order.paid ? "Paid" : "Unpaid"}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                                  {order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusBadgeClass(
                                  order.status,
                                )}`}
                              >
                                {order.status}
                              </span>

                              {/* Direct Status Selector */}
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value as OrderStatus)
                                }
                                className="block w-full max-w-[130px] rounded-lg border border-border bg-background py-1 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground focus:border-primary focus:outline-none"
                              >
                                {STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {nextAction && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(order.id, nextAction.nextStatus)
                                  }
                                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:opacity-90"
                                >
                                  <span>{nextAction.label}</span>
                                  <ChevronRight className="size-3" />
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrder(order)}
                                title="View Order Details"
                                aria-label={`View Details for ${order.code}`}
                                className="rounded-xl border border-border bg-secondary/40 p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                              >
                                <Eye className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards View */}
              <div className="divide-y divide-border lg:hidden">
                {filteredOrders.map((order) => {
                  const nextAction = getNextStatusAction(order);
                  const totalQty = order.lines.reduce((s, l) => s + l.qty, 0);

                  return (
                    <div key={order.id} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-bold text-foreground">
                              {order.code}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                order.type === "delivery"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}
                            >
                              {order.type === "delivery" ? "Delivery" : "Pickup"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {order.customer.name || "Guest"} &bull;{" "}
                            {formatRelativeTime(order.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeClass(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Order items snippet */}
                      <div className="rounded-xl bg-secondary/30 p-2.5 text-xs">
                        {order.lines.map((l, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-bold text-primary">{l.qty}x</span> {l.name}
                            {l.note && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                Note: {l.note}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-1 text-[11px]">
                          <span className="text-muted-foreground">{totalQty} items</span>
                          <span className="font-bold font-mono text-foreground">
                            {rupiah(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-foreground"
                          >
                            <Eye className="size-3" /> Details
                          </button>
                        </div>

                        {nextAction && (
                          <button
                            onClick={() => handleStatusChange(order.id, nextAction.nextStatus)}
                            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs"
                          >
                            <span>{nextAction.label}</span>
                            <ChevronRight className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {selectedOrder.code}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      selectedOrder.type === "delivery"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {selectedOrder.type === "delivery" ? "Delivery" : "Pickup"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString("en-ZA", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-border bg-secondary/50 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4 text-xs">
              {/* Status Updater */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Current Status</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeClass(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    Change status to:
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                    }
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Information */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" /> Customer Details
                  </span>
                  {selectedOrder.accountId ? (
                    <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      Registered Member
                    </span>
                  ) : (
                    <span className="rounded bg-secondary px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                      Guest Checkout
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Name</span>
                    <span className="font-semibold text-foreground">
                      {selectedOrder.customer.name || "Guest"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone / WhatsApp</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">
                        {selectedOrder.customer.phone || "-"}
                      </span>
                      {selectedOrder.customer.phone && (
                        <a
                          href={`https://wa.me/${cleanWhatsappNumber(selectedOrder.customer.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 ml-1"
                        >
                          <MessageSquare className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrder.type === "delivery" && (
                  <div className="pt-2 border-t border-border/50 text-[11px]">
                    <span className="text-muted-foreground block">Delivery Address</span>
                    <p className="font-medium text-foreground">
                      {selectedOrder.customer.address || "-"}
                    </p>
                    {selectedOrder.customer.deliveryNote && (
                      <p className="text-[10px] text-muted-foreground italic mt-0.5">
                        Note: {selectedOrder.customer.deliveryNote}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Package className="size-3.5 text-primary" /> Ordered Items
                </span>
                <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                  {(selectedOrder.lines || []).map((line, idx) => (
                    <div key={idx} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">
                            {line.qty}x {line.name}
                          </p>
                          {line.optionLabels && line.optionLabels.length > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              {line.optionLabels.join(", ")}
                            </p>
                          )}
                          {line.note && (
                            <div className="mt-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                              Kitchen Note: &ldquo;{line.note}&rdquo;
                            </div>
                          )}
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {rupiah(line.unitPrice * line.qty)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-3.5 space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{rupiah(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Discount {selectedOrder.voucherCode ? `(${selectedOrder.voucherCode})` : ""}
                    </span>
                    <span className="font-mono">-{rupiah(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.type === "delivery" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-mono">{rupiah(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="font-mono text-primary">{rupiah(selectedOrder.total)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Payment Method</span>
                  <span className="font-medium text-foreground">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
