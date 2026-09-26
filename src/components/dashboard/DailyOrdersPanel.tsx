import { useMemo, useState } from "react";
import { rupiah, useStore, type Order } from "@/lib/store";
import { StatCard } from "./DashboardShell";

const DAY = 86400000;

const dayLabel = (offset: number) => {
  const d = new Date(Date.now() - offset * DAY);
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "short" });
};

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

function OrderRow({ order }: { order: Order }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm">
      <span className="w-14 shrink-0 text-xs text-muted-foreground">{time(order.createdAt)}</span>
      <span className="font-semibold">{order.code}</span>
      <span className="min-w-28 flex-1 truncate text-xs text-muted-foreground">
        {order.customer.name || "Guest"} · {order.lines.reduce((t, l) => t + l.qty, 0)} items ·{" "}
        {order.type}
      </span>
      <span className="text-xs font-semibold">{rupiah(order.total)}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          order.status === "Completed"
            ? "bg-success/15 text-success"
            : order.status === "Cancelled"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
        }`}
      >
        {order.status}
      </span>
    </li>
  );
}

export function DailyOrdersPanel() {
  const orders = useStore((s) => s.orders);
  const [openDay, setOpenDay] = useState(0);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, offset) => {
      const from = start.getTime() - offset * DAY;
      const list = orders
        .filter((o) => o.createdAt >= from && o.createdAt < from + DAY)
        .sort((a, b) => b.createdAt - a.createdAt);
      const revenue = list.filter((o) => o.status !== "Cancelled").reduce((t, o) => t + o.total, 0);
      return { offset, list, revenue };
    });
  }, [orders]);

  const today = days[0]!;
  const week = days.reduce((t, d) => t + d.revenue, 0);
  const weekCount = days.reduce((t, d) => t + d.list.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today's orders"
          value={String(today.list.length)}
          hint={rupiah(today.revenue)}
        />
        <StatCard
          label="Completed today"
          value={String(today.list.filter((o) => o.status === "Completed").length)}
          hint="Completed"
        />
        <StatCard
          label="Cancelled today"
          value={String(today.list.filter((o) => o.status === "Cancelled").length)}
          hint="Needs review"
        />
        <StatCard label="7-day revenue" value={rupiah(week)} hint={`${weekCount} orders`} />
      </div>

      <section className="glow-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-semibold">Today's orders</h2>
          <p className="text-xs text-muted-foreground">Sorted newest first.</p>
        </div>
        {today.list.length === 0 ? (
          <p className="text-xs text-muted-foreground">No orders received today yet.</p>
        ) : (
          <ul className="space-y-2">
            {today.list.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>

      <section className="glow-card space-y-2 p-4">
        <div>
          <h2 className="text-sm font-semibold">Past 7 days history</h2>
          <p className="text-xs text-muted-foreground">Click a date to view details.</p>
        </div>
        {days.slice(1).map((d) => (
          <div key={d.offset} className="rounded-xl border border-border bg-secondary/20">
            <button
              onClick={() => setOpenDay(openDay === d.offset ? 0 : d.offset)}
              aria-expanded={openDay === d.offset}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm"
            >
              <span className="font-medium">{dayLabel(d.offset)}</span>
              <span className="text-xs text-muted-foreground">
                {d.list.length} orders · {rupiah(d.revenue)}
              </span>
            </button>
            {openDay === d.offset && (
              <ul className="space-y-2 px-3 pb-3">
                {d.list.length === 0 ? (
                  <li className="text-xs text-muted-foreground">No orders on this day.</li>
                ) : (
                  d.list.map((o) => <OrderRow key={o.id} order={o} />)
                )}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
