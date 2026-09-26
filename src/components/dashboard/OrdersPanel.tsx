import { useState } from "react";
import { Check } from "lucide-react";
import { actions, rupiah, useStore, type OrderStatus } from "@/lib/store";

const FLOW: OrderStatus[] = [
  "Pending Payment",
  "Cooking",
  "Out for Delivery",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

const FILTERS = ["All", ...FLOW] as const;

export function OrdersPanel({ readOnly = false }: { readOnly?: boolean }) {
  const orders = useStore((s) => s.orders);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-3 sm:mx-0 flex gap-1.5 overflow-x-auto px-3 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => (
            <div key={o.id} className="glow-card space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold">{o.code}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {o.type} · {o.customer?.name || "Guest"} ·{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {o.status}
                </span>
              </div>

              <ul className="space-y-1 text-xs text-muted-foreground">
                {(o.lines || []).map((l) => (
                  <li key={l.id}>
                    {l.qty}x {l.name}
                    {l.optionLabels && l.optionLabels.length
                      ? ` (${l.optionLabels.join(", ")})`
                      : ""}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold">
                {rupiah(o.total)} · {o.paymentMethod}
              </p>

              <div className="flex flex-wrap gap-2">
                {!readOnly && o.status === "Pending Payment" && (
                  <button
                    onClick={() => actions.setOrderStatus(o.id, "Cooking")}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Check className="size-3.5" /> Mark Paid
                  </button>
                )}
                {!readOnly && (
                  <select
                    value={o.status}
                    onChange={(e) => actions.setOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-input bg-secondary/40 px-2 py-1.5 text-xs"
                  >
                    {FLOW.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
