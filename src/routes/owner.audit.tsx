import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { rupiah, useStore, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/owner/audit")({
  head: () => ({
    meta: [
      { title: "Activity Logs — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Nanami Kitchen system activity history: orders, status changes, and settings updates.",
      },
      { property: "og:title", content: "Activity Logs — Nanami Kitchen" },
      { property: "og:description", content: "Nanami Kitchen system activity log." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

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

function AuditPage() {
  const orders = useStore((s) => s.orders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Exactly 8 data cards per pagination as requested

  // Map all orders to audit history entries
  const allEntries = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((o) => {
        const totalQty = o.lines.reduce((s, l) => s + l.qty, 0);
        return {
          id: o.id,
          code: o.code,
          timestamp: o.createdAt,
          timeFormatted: new Date(o.createdAt).toLocaleString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: o.customer.name || "Guest Customer",
          phone: o.customer.phone || "-",
          type: o.type,
          action: `Pesanan ${o.code} (${o.type === "delivery" ? "Delivery" : "Pickup"}) — ${totalQty} item senilai ${rupiah(o.total)}`,
          paymentMethod: o.paymentMethod,
          paid: o.paid,
          status: o.status,
          linesSummary: o.lines.map((l) => `${l.qty}x ${l.name}`).join(", "),
        };
      });
  }, [orders]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchCode = e.code.toLowerCase().includes(q);
        const matchActor = e.actor.toLowerCase().includes(q);
        const matchPhone = e.phone.toLowerCase().includes(q);
        const matchAction = e.action.toLowerCase().includes(q);
        const matchItems = e.linesSummary.toLowerCase().includes(q);
        if (!matchCode && !matchActor && !matchPhone && !matchAction && !matchItems) return false;
      }
      return true;
    });
  }, [allEntries, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedEntries = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntries, safePage]);

  return (
    <DashboardShell
      role="owner"
      title="Activity Logs & Audit History"
      subtitle="Jejak riwayat aktivitas transaksi dan pesanan masuk di Nanami Kitchen"
    >
      <SectionCard
        title="Audit History"
        description={`Total ${allEntries.length} catatan riwayat transaksi sistem.`}
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari ID pesanan, nama pelanggan, telepon, atau menu..."
              className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-input bg-secondary/40 px-3 py-2 text-xs font-semibold outline-none cursor-pointer focus:border-primary"
            >
              <option value="all">Semua Status</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Cooking">Cooking</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Audit Cards List (8 items per page) */}
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6">
            <Activity className="mx-auto size-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold text-foreground">Tidak ada riwayat aktivitas</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== "all"
                ? "Coba ubah kata kunci pencarian atau filter status Anda."
                : "Belum ada aktivitas pesanan yang tercatat."}
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {paginatedEntries.map((e) => (
              <div
                key={e.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">{e.code}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        e.type === "delivery"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {e.type === "delivery" ? (
                        <Truck className="size-2.5" />
                      ) : (
                        <ShoppingBag className="size-2.5" />
                      )}
                      {e.type === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                    <span className="text-xs font-bold text-foreground truncate">{e.actor}</span>
                    {e.phone && e.phone !== "-" && (
                      <span className="text-[11px] text-muted-foreground">({e.phone})</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">{e.action}</p>
                  {e.linesSummary && (
                    <p className="text-[11px] text-muted-foreground/80 truncate max-w-xl">
                      Item: {e.linesSummary}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                        e.status,
                      )}`}
                    >
                      {e.status}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        e.paid
                          ? "bg-emerald-500/15 text-emerald-600"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {e.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{e.timeFormatted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar (8 cards per page) */}
        {filteredEntries.length > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-4">
            <p className="text-[11px] text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {(safePage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(safePage * ITEMS_PER_PAGE, filteredEntries.length)}
              </span>{" "}
              dari <span className="font-semibold text-foreground">{filteredEntries.length}</span>{" "}
              riwayat aktivitas
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
      </SectionCard>
    </DashboardShell>
  );
}
