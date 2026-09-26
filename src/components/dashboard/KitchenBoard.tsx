import { useState } from "react";
import { ArrowRight, Clock, Utensils, X } from "lucide-react";
import { actions, rupiah, useStore, type Order, type OrderStatus } from "@/lib/store";

type Stage = {
  key: string;
  label: string;
  hint: string;
  statuses: OrderStatus[];
  next?: { label: string; status: (o: Order) => OrderStatus };
};

const STAGES: Stage[] = [
  {
    key: "incoming",
    label: "Incoming",
    hint: "Awaiting payment confirmation",
    statuses: ["Pending Payment"],
    next: { label: "Start cooking", status: () => "Cooking" },
  },
  {
    key: "cooking",
    label: "In Progress",
    hint: "Kitchen is preparing items",
    statuses: ["Cooking"],
    next: {
      label: "Mark ready",
      status: (o) => (o.type === "delivery" ? "Out for Delivery" : "Ready for Pickup"),
    },
  },
  {
    key: "ready",
    label: "Ready",
    hint: "Ready for delivery / pickup",
    statuses: ["Out for Delivery", "Ready for Pickup"],
    next: { label: "Complete order", status: () => "Completed" },
  },
  {
    key: "done",
    label: "Completed",
    hint: "Fulfilled today",
    statuses: ["Completed"],
  },
];

function waiting(createdAt: number) {
  const mins = Math.max(0, Math.round((Date.now() - createdAt) / 60000));
  if (mins < 60) return `${mins} mins`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function OrderCard({ order, stage }: { order: Order; stage: Stage }) {
  const late = stage.key !== "done" && Date.now() - order.createdAt > 30 * 60000;

  return (
    <article className="glow-card space-y-2.5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">{order.code}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {order.type} · {order.customer.name || "Guest"}
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            late ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground"
          }`}
        >
          <Clock className="size-3" />
          {waiting(order.createdAt)}
        </span>
      </div>

      <ul className="space-y-1 text-xs text-muted-foreground">
        {(order.lines || []).map((l) => (
          <li key={l.id}>
            <span className="font-semibold text-foreground">{l.qty}x</span> {l.name}
            {l.optionLabels && l.optionLabels.length ? ` (${l.optionLabels.join(", ")})` : ""}
            {l.note ? ` — ${l.note}` : ""}
          </li>
        ))}
      </ul>

      <p className="text-sm font-semibold">
        {rupiah(order.total)}{" "}
        <span className="text-xs font-normal text-muted-foreground">{order.paymentMethod}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {stage.next && (
          <button
            onClick={() => actions.setOrderStatus(order.id, stage.next!.status(order))}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            {stage.next.label} <ArrowRight className="size-3.5" />
          </button>
        )}
        {stage.key !== "done" && (
          <button
            onClick={() => actions.setOrderStatus(order.id, "Cancelled")}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            <X className="size-3.5" /> Cancel
          </button>
        )}
      </div>
    </article>
  );
}

export function KitchenBoard() {
  const orders = useStore((s) => s.orders);
  const [mobileStage, setMobileStage] = useState(STAGES[0]!.key);

  const grouped = STAGES.map((stage) => {
    const list = orders
      .filter((o) => stage.statuses.includes(o.status))
      .filter((o) => stage.key !== "done" || Date.now() - o.createdAt < 86400000)
      .sort((a, b) => a.createdAt - b.createdAt);
    return { stage, list };
  });

  const active = grouped.find((g) => g.stage.key === mobileStage) ?? grouped[0]!;

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 xl:hidden">
        {grouped.map(({ stage, list }) => (
          <button
            key={stage.key}
            onClick={() => setMobileStage(stage.key)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              mobileStage === stage.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/40 text-muted-foreground"
            }`}
          >
            {stage.label} · {list.length}
          </button>
        ))}
      </div>

      <div className="space-y-3 lg:hidden">
        <p className="text-xs text-muted-foreground">{active.stage.hint}</p>
        {active.list.length === 0 ? (
          <EmptyStage label={active.stage.label} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.list.map((o) => (
              <OrderCard key={o.id} order={o} stage={active.stage} />
            ))}
          </div>
        )}
      </div>

      <div className="hidden gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:items-start">
        {grouped.map(({ stage, list }) => (
          <section key={stage.key} className="rounded-2xl border border-border bg-popover/40 p-3">
            <header className="mb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">{stage.label}</h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                  {list.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{stage.hint}</p>
            </header>
            <div className="space-y-3">
              {list.length === 0 ? (
                <EmptyStage label={stage.label} />
              ) : (
                list.map((o) => <OrderCard key={o.id} order={o} stage={stage} />)
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function EmptyStage({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-8 text-center">
      <Utensils className="size-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">No orders in {label} stage.</p>
    </div>
  );
}
