import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  MessageSquare,
  Package,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
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
  type CartLine,
  type MenuItem,
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

const PAYMENT_METHODS = [
  "Cash on Delivery (COD)",
  "QRIS",
  "Bank Transfer",
  "Manual Cash / Kasir",
  "E-Wallet (GoPay/OVO/ShopeePay)",
  "Debit / Credit Card",
  "WhatsApp Checkout",
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

interface OrderManagementPanelProps {
  isOwner?: boolean;
}

export function OrderManagementPanel({ isOwner = false }: OrderManagementPanelProps) {
  const orders = useStore((s) => s.orders);
  const menu = useStore((s) => s.menu);
  const settings = useStore((s) => s.settings);

  const [activeTab, setActiveTab] = useState<StatusTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest">("newest");
  const [viewMode, setViewMode] = useState<"pipeline" | "recap">("pipeline");

  // Pagination states (8 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, safePage]);

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

  function handleDeleteOrder(order: Order) {
    actions.deleteOrder(order.id);
    setDeletingOrder(null);
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
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

      {/* View Mode Toggle & Create Button Header */}
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

        {/* Owner-Only: Create Manual Order Button */}
        {isOwner && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-95 active:scale-95"
          >
            <Plus className="size-4" />
            <span>Buat Pesanan Baru</span>
          </button>
        )}
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
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("pending");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("cooking");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("ready");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("completed");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("cancelled");
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search order ID, customer name, phone, item..."
                className="w-full rounded-2xl border border-border bg-background py-2 pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as "all" | "delivery" | "pickup");
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as "all" | "today" | "yesterday" | "week");
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as "newest" | "oldest" | "highest");
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus:border-primary focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
              </select>
            </div>
          </div>

          {/* Orders Table Container */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No orders found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery || typeFilter !== "all" || dateFilter !== "all" || activeTab !== "all"
                  ? "Try changing your search keywords or filter options."
                  : "No orders have been placed in this category yet."}
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm"
                >
                  <Plus className="size-3.5" /> Buat Pesanan Baru
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
                    {paginatedOrders.map((order) => {
                      const nextAction = getNextStatusAction(order);
                      const totalQty = order.lines.reduce((s, l) => s + l.qty, 0);

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
                                  {new Date(order.createdAt).toLocaleTimeString("id-ID", {
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
                                  {order.customer.name || "Customer"}
                                </span>
                                {order.accountId && (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                                    Member
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

                              {/* Owner-only: Edit Button */}
                              {isOwner && (
                                <button
                                  onClick={() => setEditingOrder(order)}
                                  title="Edit Order"
                                  aria-label={`Edit ${order.code}`}
                                  className="rounded-xl border border-border bg-secondary/40 p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                              )}

                              {/* Owner-only: Delete Button */}
                              {isOwner && (
                                <button
                                  onClick={() => setDeletingOrder(order)}
                                  title="Delete Order"
                                  aria-label={`Delete ${order.code}`}
                                  className="rounded-xl border border-border bg-secondary/40 p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}

                              {/* Details Button */}
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
                {paginatedOrders.map((order) => {
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
                            {order.customer.name || "Customer"} &bull;{" "}
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
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                          >
                            <Eye className="size-3" /> Details
                          </button>

                          {isOwner && (
                            <>
                              <button
                                onClick={() => setEditingOrder(order)}
                                className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                              >
                                <Pencil className="size-3" /> Edit
                              </button>
                              <button
                                onClick={() => setDeletingOrder(order)}
                                className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-3" /> Hapus
                              </button>
                            </>
                          )}
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

              {/* Pagination Controls Bar */}
              {filteredOrders.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-secondary/10">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-semibold text-foreground">
                      {(safePage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                      {Math.min(safePage * ITEMS_PER_PAGE, filteredOrders.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-foreground">{filteredOrders.length}</span>{" "}
                    pesanan
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                    >
                      <ChevronLeft className="size-3.5" /> Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                        if (
                          totalPages > 5 &&
                          num !== 1 &&
                          num !== totalPages &&
                          Math.abs(num - safePage) > 1
                        ) {
                          if (num === 2 || num === totalPages - 1) {
                            return (
                              <span key={num} className="px-1 text-xs text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCurrentPage(num)}
                            className={`size-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              safePage === num
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-background text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
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
                  {new Date(selectedOrder.createdAt).toLocaleDateString("id-ID", {
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
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const ord = selectedOrder;
                        setSelectedOrder(null);
                        setEditingOrder(ord);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Pencil className="size-3.5" /> Edit Pesanan
                    </button>
                    <button
                      onClick={() => {
                        const ord = selectedOrder;
                        setSelectedOrder(null);
                        setDeletingOrder(ord);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner-Only: Create or Edit Order Modal */}
      {(isCreateOpen || editingOrder) && (
        <OrderEditorModal
          initialOrder={editingOrder}
          menu={menu}
          defaultDeliveryFee={settings.deliveryFee || 15000}
          isOpen={true}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingOrder(null);
          }}
          onSave={(savedOrder, isNew) => {
            if (isNew) {
              actions.createManualOrder(savedOrder);
            } else {
              actions.updateOrder(savedOrder);
            }
            setIsCreateOpen(false);
            setEditingOrder(null);
          }}
        />
      )}

      {/* Owner-Only: Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto">
              <Trash2 className="size-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">Hapus Pesanan?</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pesanan <strong className="text-foreground">{deletingOrder.code}</strong> atas nama{" "}
                <strong className="text-foreground">
                  {deletingOrder.customer.name || "Pelanggan"}
                </strong>{" "}
                akan dihapus permanen dari sistem dan database.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="flex-1 rounded-2xl border border-border bg-secondary/50 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrder(deletingOrder)}
                className="flex-1 rounded-2xl bg-destructive py-2.5 text-xs font-bold text-destructive-foreground hover:opacity-90 shadow-sm"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ORDER EDITOR MODAL (Used by Owner to Create or Edit an Order)
// ---------------------------------------------------------------------------
interface OrderEditorModalProps {
  initialOrder: Order | null;
  menu: MenuItem[];
  defaultDeliveryFee: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order, isNew: boolean) => void;
}

function OrderEditorModal({
  initialOrder,
  menu,
  defaultDeliveryFee,
  isOpen,
  onClose,
  onSave,
}: OrderEditorModalProps) {
  const isNew = !initialOrder;

  const [code, setCode] = useState(
    initialOrder?.code || "NK-" + Math.floor(1000 + Math.random() * 9000),
  );
  const [type, setType] = useState<"delivery" | "pickup">(initialOrder?.type || "delivery");
  const [customerName, setCustomerName] = useState(initialOrder?.customer.name || "");
  const [customerPhone, setCustomerPhone] = useState(initialOrder?.customer.phone || "");
  const [customerAddress, setCustomerAddress] = useState(initialOrder?.customer.address || "");
  const [deliveryNote, setDeliveryNote] = useState(initialOrder?.customer.deliveryNote || "");
  const [status, setStatus] = useState<OrderStatus>(initialOrder?.status || "Cooking");
  const [paid, setPaid] = useState<boolean>(initialOrder?.paid ?? true);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    initialOrder?.paymentMethod || "Manual Cash / Kasir",
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    initialOrder ? initialOrder.deliveryFee : type === "delivery" ? defaultDeliveryFee : 0,
  );
  const [discount, setDiscount] = useState<number>(initialOrder?.discount || 0);
  const [voucherCode, setVoucherCode] = useState<string>(initialOrder?.voucherCode || "");
  const [etaMinutes, setEtaMinutes] = useState<number>(initialOrder?.etaMinutes || 20);

  // Order Lines
  const [lines, setLines] = useState<CartLine[]>(initialOrder?.lines || []);

  // New Item Selector State
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(menu[0]?.id || "");
  const [addItemQty, setAddItemQty] = useState<number>(1);
  const [addItemNote, setAddItemNote] = useState<string>("");

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  }, [lines]);

  const effectiveDeliveryFee = type === "delivery" ? Number(deliveryFee) || 0 : 0;
  const effectiveDiscount = Number(discount) || 0;
  const total = Math.max(0, subtotal - effectiveDiscount + effectiveDeliveryFee);

  function handleAddMenuItem() {
    const item = menu.find((m) => m.id === selectedMenuItemId);
    if (!item) return;

    const existingIdx = lines.findIndex((l) => l.itemId === item.id && !l.note && !addItemNote);
    if (existingIdx >= 0) {
      setLines((prev) =>
        prev.map((l, idx) => (idx === existingIdx ? { ...l, qty: l.qty + addItemQty } : l)),
      );
    } else {
      const newLine: CartLine = {
        id: "line_" + Math.random().toString(36).substring(2, 9),
        itemId: item.id,
        name: item.name,
        unitPrice: item.price,
        qty: addItemQty,
        optionLabels: [],
        note: addItemNote.trim(),
      };
      setLines((prev) => [...prev, newLine]);
    }

    setAddItemQty(1);
    setAddItemNote("");
  }

  function handleRemoveLine(lineId: string) {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  }

  function handleUpdateLineQty(lineId: string, newQty: number) {
    if (newQty <= 0) {
      handleRemoveLine(lineId);
    } else {
      setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, qty: newQty } : l)));
    }
  }

  function handleUpdateLinePrice(lineId: string, newPrice: number) {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, unitPrice: Math.max(0, newPrice) } : l)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Silakan masukkan nama pelanggan.");
      return;
    }
    if (lines.length === 0) {
      alert("Silakan tambahkan minimal 1 item menu ke dalam pesanan.");
      return;
    }

    const finalOrder: Order = {
      id:
        initialOrder?.id ||
        "ord_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      code: code.trim() || "NK-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: initialOrder?.createdAt || Date.now(),
      type,
      lines,
      subtotal,
      discount: effectiveDiscount,
      voucherCode: voucherCode.trim(),
      deliveryFee: effectiveDeliveryFee,
      total,
      status,
      paid,
      paymentMethod,
      pointsEarned: initialOrder?.pointsEarned ?? Math.floor(total / 10000) * 10,
      etaMinutes: Number(etaMinutes) || 20,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: type === "delivery" ? customerAddress.trim() : "",
        deliveryNote: deliveryNote.trim(),
        lat: initialOrder?.customer.lat,
        lng: initialOrder?.customer.lng,
        mapsUrl: initialOrder?.customer.mapsUrl,
      },
      accountId: initialOrder?.accountId || null,
    };

    onSave(finalOrder, isNew);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isNew ? "Buat Pesanan Baru (Owner)" : `Edit Pesanan #${code}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNew
                ? "Tambahkan pesanan manual langsung ke sistem dapur & database"
                : "Ubah rincian pesanan, item, status pembayaran, atau info pengiriman"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border bg-secondary/50 p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5 text-xs">
          {/* Order Meta Header */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-border bg-secondary/20 p-3.5">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground">
                Kode Pesanan
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-bold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground">
                Tipe Layanan
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as "delivery" | "pickup";
                  setType(newType);
                  if (newType === "pickup") setDeliveryFee(0);
                  else if (deliveryFee === 0) setDeliveryFee(defaultDeliveryFee);
                }}
                className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup / Ambil Sendiri</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground">
                Status Pesanan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground">
                Status Bayar
              </label>
              <select
                value={paid ? "paid" : "unpaid"}
                onChange={(e) => setPaid(e.target.value === "paid")}
                className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                <option value="paid">Sudah Dibayar (Paid)</option>
                <option value="unpaid">Belum Dibayar (Unpaid)</option>
              </select>
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="rounded-2xl border border-border bg-secondary/15 p-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-primary" /> Informasi Pelanggan
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {type === "delivery" && (
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground">
                    Alamat Pengantaran
                  </label>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Alamat lengkap tujuan delivery..."
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground">
                    Catatan Pengantaran (Opsional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Contoh: Rumah pagar hitam samping warung"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items Section */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" /> Daftar Item Pesanan ({lines.length})
              </h3>
            </div>

            {/* Existing lines list */}
            {lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-4 text-center text-muted-foreground">
                Belum ada menu yang dimasukkan. Pilih menu di bawah untuk menambahkan.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {lines.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-bold text-foreground">{l.name}</p>
                      {l.note && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                          Catatan: {l.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Unit Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">@</span>
                        <input
                          type="number"
                          value={l.unitPrice}
                          onChange={(e) => handleUpdateLinePrice(l.id, Number(e.target.value))}
                          className="w-20 rounded-lg border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-right focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateLineQty(l.id, l.qty - 1)}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateLineQty(l.id, l.qty + 1)}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <span className="w-24 text-right font-mono font-bold text-foreground">
                        {rupiah(l.unitPrice * l.qty)}
                      </span>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(l.id)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Menu Item Tool */}
            <div className="rounded-xl bg-secondary/30 p-3 space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground">
                Tambah Menu ke Pesanan:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedMenuItemId}
                  onChange={(e) => setSelectedMenuItemId(e.target.value)}
                  className="flex-1 min-w-[180px] rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                >
                  {menu.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {rupiah(m.price)}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground">Qty:</span>
                  <input
                    type="number"
                    min={1}
                    value={addItemQty}
                    onChange={(e) => setAddItemQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-14 rounded-xl border border-border bg-background px-2 py-1.5 text-center text-xs font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  value={addItemNote}
                  onChange={(e) => setAddItemNote(e.target.value)}
                  placeholder="Catatan khusus menu (cth: pedas)..."
                  className="flex-1 min-w-[150px] rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleAddMenuItem}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95"
                >
                  <Plus className="size-3.5" /> Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Payment & Financial Calculations */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Estimasi Selesai (Menit)
                </label>
                <input
                  type="number"
                  min={5}
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value) || 20)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Kode Voucher (Opsional)
                </label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Contoh: DISKON10"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono uppercase focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-card p-3 border border-border/80">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Items:</span>
                <span className="font-mono font-semibold">{rupiah(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Diskon Potongan (Rp):</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 rounded-lg border border-border bg-background px-2 py-0.5 text-right font-mono text-xs font-semibold text-emerald-600 focus:border-primary focus:outline-none"
                />
              </div>

              {type === "delivery" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ongkir Delivery (Rp):</span>
                  <input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 rounded-lg border border-border bg-background px-2 py-0.5 text-right font-mono text-xs font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                <span>Total Akhir:</span>
                <span className="font-mono text-base text-primary">{rupiah(total)}</span>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border bg-secondary/50 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
            >
              {isNew ? "Simpan Pesanan Baru" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
