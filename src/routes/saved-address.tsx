import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Plus, Trash2 } from "lucide-react";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/saved-address")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — Nanami Kitchen" },
      {
        name: "description",
        content: "Choose one of your saved delivery addresses or add a new one.",
      },
      { property: "og:title", content: "Saved Addresses — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Choose one of your saved delivery addresses or add a new one.",
      },
    ],
  }),
  component: SavedAddressPage,
});

function labelFor(index: number) {
  if (index === 0) return "Main Address";
  if (index === 1) return "Secondary Address";
  return `Saved Address #${index + 1}`;
}

function SavedAddressPage() {
  const navigate = useNavigate();
  const { addresses, current } = useStore((s) => ({
    addresses: s.profile.addresses,
    current: s.profile.address,
  }));

  const items = useMemo(
    () =>
      addresses && addresses.length > 0
        ? addresses.map((a, i) => ({ label: labelFor(i), address: a }))
        : [],
    [addresses],
  );

  const [selected, setSelected] = useState(
    items.findIndex((it) => it.address === current) >= 0
      ? items.findIndex((it) => it.address === current)
      : 0,
  );

  function choose(index: number) {
    const item = items[index];
    if (!item) return;
    setSelected(index);
    actions.updateProfile({ address: item.address });
    actions.saveAddress(item.address);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground flex justify-center selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md min-h-screen bg-background relative sm:shadow-2xl sm:border-x sm:border-border/40 px-4 pt-5 pb-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/checkout" });
              }
            }}
            aria-label="Back"
            className="text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-2xl font-semibold">Saved Addresses</h1>
        </div>

        {/* Address List or Empty State */}
        {items.length === 0 ? (
          <div className="my-auto py-12 text-center rounded-2xl border border-dashed border-border p-6 space-y-3">
            <MapPin className="mx-auto size-10 text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">No Saved Addresses Yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              You haven&apos;t saved any delivery addresses yet. Add a new delivery address for
              faster checkout.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item, index) => {
              const active = index === selected;
              return (
                <div
                  key={`${item.address}-${index}`}
                  className={`flex items-start gap-3 rounded-2xl border bg-card p-4 transition-colors ${
                    active ? "border-primary ring-1 ring-primary/20 shadow-xs" : "border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => choose(index)}
                    className="flex flex-1 items-start gap-3 text-left cursor-pointer min-w-0"
                  >
                    <MapPin
                      className={`mt-0.5 size-5 shrink-0 ${
                        active ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground break-words">
                        {item.address}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-primary" : "border-muted-foreground"
                      }`}
                    >
                      {active && <span className="size-2.5 rounded-full bg-primary" />}
                    </span>
                  </button>

                  {/* Remove option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove address "${item.address}"?`)) {
                        actions.removeAddress(item.address);
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer shrink-0 mt-0.5"
                    title="Remove address"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new address */}
        <div className="mt-auto pt-8">
          <button
            onClick={() => navigate({ to: "/address" })}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="size-4" />
            <span>Add New Address</span>
          </button>
        </div>
      </div>
    </div>
  );
}
