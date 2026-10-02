import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  Search,
  ShoppingBag,
  TrendingUp,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell, SectionCard, StatCard } from "@/components/dashboard/DashboardShell";
import { cleanWhatsappNumber, rupiah, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/owner/finance")({
  head: () => ({
    meta: [
      { title: "Financial & Revenue Reports — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Official financial reports and revenue charts from all completed orders at Nanami Kitchen.",
      },
      { property: "og:title", content: "Financial & Revenue Reports — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Financial revenue analysis and completed orders breakdown for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinancePage,
});

type DateFilterOption = "all" | "today" | "yesterday" | "7days" | "30days" | "thisMonth";

function FinancePage() {
  const orders = useStore((s) => s.orders);

  // CRITICAL: Only orders with status === "Completed" enter financial calculations
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Completed");
  }, [orders]);

  // Filter states
  const [dateRange, setDateRange] = useState<DateFilterOption>("7days");
  const [typeFilter, setTypeFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");

  // Pagination for Completed Transactions Table
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Timestamps for filtering
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysAgo = todayStart - 6 * 86400000;
  const thirtyDaysAgo = todayStart - 29 * 86400000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtered Completed Orders
  const filteredCompletedOrders = useMemo(() => {
    return completedOrders
      .filter((o) => {
        // Date filter
        if (dateRange === "today" && o.createdAt < todayStart) return false;
        if (
          dateRange === "yesterday" &&
          (o.createdAt < yesterdayStart || o.createdAt >= todayStart)
        )
          return false;
        if (dateRange === "7days" && o.createdAt < sevenDaysAgo) return false;
        if (dateRange === "30days" && o.createdAt < thirtyDaysAgo) return false;
        if (dateRange === "thisMonth" && o.createdAt < monthStart) return false;

        // Type filter
        if (typeFilter !== "all" && o.type !== typeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCode = o.code.toLowerCase().includes(q);
          const matchName = (o.customer.name || "").toLowerCase().includes(q);
          const matchPhone = (o.customer.phone || "").toLowerCase().includes(q);
          const matchPayment = (o.paymentMethod || "").toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchPhone && !matchPayment) return false;
        }

        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [
    completedOrders,
    dateRange,
    typeFilter,
    searchQuery,
    todayStart,
    yesterdayStart,
    sevenDaysAgo,
    thirtyDaysAgo,
    monthStart,
  ]);

  // Overall Financial Metric Calculations from Completed Orders
  const metrics = useMemo(() => {
    const totalRevenue = filteredCompletedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCount = filteredCompletedOrders.length;
    const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    const deliveryOrders = filteredCompletedOrders.filter((o) => o.type === "delivery");
    const pickupOrders = filteredCompletedOrders.filter((o) => o.type === "pickup");

    const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
    const pickupRevenue = pickupOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalRevenue,
      totalCount,
      avgOrderValue,
      deliveryCount: deliveryOrders.length,
      deliveryRevenue,
      pickupCount: pickupOrders.length,
      pickupRevenue,
    };
  }, [filteredCompletedOrders]);

  // Chart Data Generation (Group completed orders by date)
  const chartData = useMemo(() => {
    const daysMap = new Map<
      string,
      { label: string; dateKey: string; revenue: number; orders: number }
    >();

    // Determine how many days back to plot
    let daysCount = 7;
    if (dateRange === "today" || dateRange === "yesterday") daysCount = 2;
    else if (dateRange === "30days" || dateRange === "thisMonth") daysCount = 30;
    else if (dateRange === "all") daysCount = 30;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(todayStart - i * 86400000);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      daysMap.set(dateKey, { label, dateKey, revenue: 0, orders: 0 });
    }

    // Populate data from filtered completed orders
    for (const order of filteredCompletedOrders) {
      const od = new Date(order.createdAt);
      const dateKey = `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, "0")}-${String(od.getDate()).padStart(2, "0")}`;
      const existing = daysMap.get(dateKey);
      if (existing) {
        existing.revenue += order.total;
        existing.orders += 1;
      } else if (dateRange === "all") {
        const label = od.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        daysMap.set(dateKey, { label, dateKey, revenue: order.total, orders: 1 });
      }
    }

    return Array.from(daysMap.values());
  }, [filteredCompletedOrders, todayStart, dateRange]);

  // Paginated Completed Orders
  const totalPages = Math.max(1, Math.ceil(filteredCompletedOrders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredCompletedOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompletedOrders, safePage]);

  return (
    <DashboardShell
      role="owner"
      title="Financial & Revenue Reports"
      subtitle="Official revenue analysis and transaction breakdown from completed orders"
    >
      <div className="space-y-6">
        {/* KPI Metrics Cards Banner */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Completed Revenue"
            value={rupiah(metrics.totalRevenue)}
            hint={`${metrics.totalCount} completed orders`}
          />
          <StatCard
            label="Average Order Value (AOV)"
            value={rupiah(metrics.avgOrderValue)}
            hint="Per completed transaction"
          />
          <StatCard
            label="Delivery Revenue"
            value={rupiah(metrics.deliveryRevenue)}
            hint={`${metrics.deliveryCount} delivery orders`}
          />
          <StatCard
            label="Pickup / Takeaway Revenue"
            value={rupiah(metrics.pickupRevenue)}
            hint={`${metrics.pickupCount} pickup orders`}
          />
        </div>

        {/* Interactive Chart Section with Dedicated Filters */}
        <SectionCard
          title="Revenue & Completed Orders Trend"
          description="Visual sales performance and order volume from completed transactions over the selected time range."
        >
          {/* Controls / Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
            {/* Metric Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/30 p-1">
              <button
                type="button"
                onClick={() => setChartMetric("revenue")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  chartMetric === "revenue"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="size-3.5" />
                <span>Revenue Amount</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("orders")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  chartMetric === "orders"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="size-3.5" />
                <span>Order Volume</span>
              </button>
            </div>

            {/* Date Range & Type Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value as DateFilterOption);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="all">All Time</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as "all" | "delivery" | "pickup");
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Types (Delivery & Pickup)</option>
                <option value="delivery">Delivery Only</option>
                <option value="pickup">Pickup Only</option>
              </select>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="financeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary, #3b82f6)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary, #3b82f6)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground, #888)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground, #888)" }}
                  tickFormatter={(val) =>
                    chartMetric === "revenue" ? rupiah(val) : `${val} orders`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-foreground">{label}</p>
                          <p className="text-primary font-bold font-mono text-sm">
                            {rupiah(data.revenue)}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {data.orders} completed order{data.orders === 1 ? "" : "s"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric === "revenue" ? "revenue" : "orders"}
                  stroke="var(--primary, #3b82f6)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#financeRevenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Completed Transactions Table Section */}
        <SectionCard
          title="Completed Transactions History"
          description={`Total of ${filteredCompletedOrders.length} completed transactions recorded in the system.`}
        >
          {/* Search bar */}
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search order ID, customer name, phone, payment method..."
              className="w-full rounded-2xl border border-border bg-secondary/30 py-2 pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {filteredCompletedOrders.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6">
              <CheckCircle2 className="mx-auto size-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No completed orders found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || dateRange !== "7days" || typeFilter !== "all"
                  ? "Try adjusting your search query or date range filters."
                  : "Orders marked as 'Completed' on the /owner/orders page will automatically show up here."}
              </p>
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3">Order & Time</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items Ordered</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Payment Method</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedOrders.map((order) => {
                      const totalQty = order.lines.reduce((s, l) => s + l.qty, 0);

                      return (
                        <tr key={order.id} className="transition hover:bg-secondary/15">
                          {/* Order & Time */}
                          <td className="px-4 py-3.5 align-top">
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
                                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground block">
                                {order.customer.name || "Guest"}
                              </span>
                              {order.customer.phone && (
                                <span className="text-[11px] text-muted-foreground block">
                                  {order.customer.phone}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-4 py-3.5 align-top max-w-[240px]">
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium text-foreground truncate">
                                {order.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {totalQty} item{totalQty === 1 ? "" : "s"}
                              </span>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3.5 align-top">
                            <p className="font-mono text-xs font-bold text-foreground">
                              {rupiah(order.total)}
                            </p>
                            <span className="text-[10px] font-bold text-emerald-600">
                              Paid / Settled
                            </span>
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3.5 align-top">
                            <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground">
                              {order.paymentMethod}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 align-top text-right">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="size-3" /> Completed
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="divide-y divide-border lg:hidden">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {order.code}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            order.type === "delivery"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {order.type === "delivery" ? "Delivery" : "Pickup"}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-primary">
                        {rupiah(order.total)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {order.customer.name || "Guest"} &bull;{" "}
                      {order.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>{order.paymentMethod}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="size-3" /> Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              {filteredCompletedOrders.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-3">
                  <p className="text-[11px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {(safePage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                      {Math.min(safePage * ITEMS_PER_PAGE, filteredCompletedOrders.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {filteredCompletedOrders.length}
                    </span>{" "}
                    completed transactions
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
                                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                      className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
