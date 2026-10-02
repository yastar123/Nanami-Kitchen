import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  DashboardShell,
  SectionCard,
  StatCard,
  fieldClass,
} from "@/components/dashboard/DashboardShell";
import { cleanWhatsappNumber, uid } from "@/lib/store";

export const Route = createFileRoute("/owner/outlets")({
  head: () => ({
    meta: [
      { title: "Outlets Management — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage Nanami Kitchen outlet locations, operational hours, contact details, and open/closed statuses.",
      },
      { property: "og:title", content: "Outlets Management — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Outlet locations directory and opening hours for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OutletsPage,
});

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  open: boolean;
  mapsUrl?: string;
  isMain?: boolean;
}

const INITIAL_OUTLETS: Outlet[] = [
  {
    id: "outlet-1",
    name: "Nanami Kitchen — Main Central Store",
    address: "77 Independence Ave, Windhoek, Namibia",
    phone: "+264811234567",
    hours: "09:00 - 22:00",
    open: true,
    mapsUrl: "https://maps.google.com/?q=-22.5609,17.0658",
    isMain: true,
  },
  {
    id: "outlet-2",
    name: "Nanami Kitchen — Grove Mall Branch",
    address: "Shop 42, Grove Mall of Namibia, Kleine Kuppe, Windhoek",
    phone: "+264812345678",
    hours: "10:00 - 21:00",
    open: true,
    mapsUrl: "https://maps.google.com/?q=-22.6105,17.0911",
    isMain: false,
  },
  {
    id: "outlet-3",
    name: "Nanami Kitchen — Swakopmund Waterfront",
    address: "Waterfront Commercial Center, Swakopmund, Namibia",
    phone: "+264813456789",
    hours: "11:00 - 21:30",
    open: false,
    mapsUrl: "https://maps.google.com/?q=-22.6789,14.5269",
    isMain: false,
  },
];

const STORAGE_KEY = "nanami_kitchen_outlets_v1";

function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load outlets from localStorage", e);
      }
    }
    return INITIAL_OUTLETS;
  });

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(outlets));
      } catch (e) {
        console.error("Failed to persist outlets", e);
      }
    }
  }, [outlets]);

  // Form states (Create / Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [open, setOpen] = useState(true);
  const [isMain, setIsMain] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");

  const filteredOutlets = useMemo(() => {
    return outlets.filter((o) => {
      if (statusFilter === "open" && !o.open) return false;
      if (statusFilter === "closed" && o.open) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = o.name.toLowerCase().includes(q);
        const matchAddr = o.address.toLowerCase().includes(q);
        const matchPhone = (o.phone || "").toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchPhone) return false;
      }
      return true;
    });
  }, [outlets, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = outlets.length;
    const openCount = outlets.filter((o) => o.open).length;
    const closedCount = total - openCount;
    return { total, openCount, closedCount };
  }, [outlets]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
    setHours("");
    setMapsUrl("");
    setOpen(true);
    setIsMain(false);
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingId(outlet.id);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone || "");
    setHours(outlet.hours || "");
    setMapsUrl(outlet.mapsUrl || "");
    setOpen(outlet.open);
    setIsMain(Boolean(outlet.isMain));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (outlet: Outlet) => {
    if (confirm(`Are you sure you want to delete outlet "${outlet.name}"?`)) {
      setOutlets((prev) => prev.filter((o) => o.id !== outlet.id));
      if (editingId === outlet.id) {
        resetForm();
      }
    }
  };

  const handleToggleOpen = (id: string) => {
    setOutlets((prev) => prev.map((o) => (o.id === id ? { ...o, open: !o.open } : o)));
  };

  const handleSetMain = (id: string) => {
    setOutlets((prev) => prev.map((o) => ({ ...o, isMain: o.id === id })));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    if (editingId) {
      // UPDATE
      setOutlets((prev) =>
        prev.map((o) => {
          if (o.id === editingId) {
            return {
              ...o,
              name: name.trim(),
              address: address.trim(),
              phone: phone.trim(),
              hours: hours.trim() || "10:00 - 22:00",
              mapsUrl: mapsUrl.trim() || undefined,
              open,
              isMain: isMain ? true : isMain,
            };
          }
          // If this one is marked as main, demote others
          if (isMain) {
            return { ...o, isMain: false };
          }
          return o;
        }),
      );
    } else {
      // CREATE
      const newOutlet: Outlet = {
        id: "outlet-" + uid(),
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        hours: hours.trim() || "10:00 - 22:00",
        open,
        mapsUrl: mapsUrl.trim() || undefined,
        isMain,
      };

      setOutlets((prev) => {
        const updated = isMain ? prev.map((o) => ({ ...o, isMain: false })) : [...prev];
        return [newOutlet, ...updated];
      });
    }

    resetForm();
  };

  return (
    <DashboardShell
      role="owner"
      title="Outlets & Branch Management"
      subtitle="Manage kitchen branch locations, operational hours, contact info, and open/closed statuses"
    >
      <div className="space-y-6 pb-20">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Branches"
            value={String(stats.total)}
            hint="Registered kitchen locations"
          />
          <StatCard
            label="Currently Open"
            value={String(stats.openCount)}
            hint="Accepting incoming orders"
          />
          <StatCard
            label="Temporarily Closed"
            value={String(stats.closedCount)}
            hint="Unavailable for ordering"
          />
        </div>

        {/* Main Grid: Form (Left) & Outlets Directory (Right) */}
        <div className="grid gap-6 xl:grid-cols-[380px_1fr] xl:items-start">
          {/* Form Card (Create & Update) */}
          <SectionCard
            title={editingId ? "Edit Branch Location" : "Add New Outlet Branch"}
            description={
              editingId
                ? "Update outlet address, operational schedule, and contact details."
                : "Register a new branch or kitchen location in the system."
            }
          >
            {editingId && (
              <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-semibold mb-2">
                <span>Editing branch details</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="underline text-[11px] cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <label className="block text-xs font-semibold text-foreground">
                Branch / Outlet Name <span className="text-destructive">*</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Nanami Kitchen — Central Branch"
                />
              </label>

              <label className="block text-xs font-semibold text-foreground">
                Complete Address <span className="text-destructive">*</span>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`${fieldClass} resize-none`}
                  placeholder="e.g. 77 Independence Ave, Windhoek, Namibia"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block text-xs font-semibold text-foreground">
                  Phone / WhatsApp
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. +264811234567"
                  />
                </label>

                <label className="block text-xs font-semibold text-foreground">
                  Operating Hours
                  <input
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. 10:00 - 22:00"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-foreground">
                Google Maps Link (Optional)
                <input
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. https://maps.google.com/?q=..."
                />
              </label>

              <div className="space-y-2 pt-1 border-t border-border/60">
                {/* Open/Closed Toggle */}
                <label className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-2.5 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-foreground">Branch Status</p>
                    <p className="text-[10px] text-muted-foreground">
                      {open ? "Branch is open for orders" : "Branch is temporarily closed"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={open}
                    onChange={(e) => setOpen(e.target.checked)}
                    className="size-4 accent-primary rounded cursor-pointer"
                  />
                </label>

                {/* Main Store Toggle */}
                <label className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-2.5 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-foreground">Headquarter / Main Branch</p>
                    <p className="text-[10px] text-muted-foreground">
                      Mark this branch as the primary kitchen location
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="size-4 accent-primary rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !address.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition cursor-pointer shadow-sm"
                >
                  <Check className="size-4" />
                  <span>{editingId ? "Save Outlet Changes" : "Create Outlet"}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </SectionCard>

          {/* Outlets Directory List (Right) */}
          <SectionCard
            title="Outlet Directory"
            description={`Total of ${outlets.length} physical kitchen branches registered.`}
          >
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search branch name, address, phone..."
                  className="w-full rounded-xl border border-input bg-secondary/30 pl-8 pr-8 py-1.5 text-xs outline-none focus:border-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  All ({outlets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("open")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    statusFilter === "open"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Open ({stats.openCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("closed")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    statusFilter === "closed"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Closed ({stats.closedCount})
                </button>
              </div>
            </div>

            {/* Outlets Grid */}
            {filteredOutlets.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6">
                <Store className="mx-auto size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-bold text-foreground">No outlet branches found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search query or status filter."
                    : "Add your first branch location using the form on the left."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredOutlets.map((outlet) => (
                  <div
                    key={outlet.id}
                    className={`rounded-2xl border p-4 transition space-y-3 bg-card ${
                      outlet.isMain
                        ? "border-primary/40 ring-1 ring-primary/20 shadow-xs"
                        : "border-border hover:shadow-sm"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {outlet.name}
                          </h3>
                          {outlet.isMain && (
                            <span className="inline-flex items-center gap-1 rounded bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.2">
                              <Star className="size-2.5 fill-primary" /> Main HQ
                            </span>
                          )}
                        </div>

                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0 mt-0.5 text-primary" />
                          <span className="line-clamp-2">{outlet.address}</span>
                        </p>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleOpen(outlet.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold shrink-0 transition cursor-pointer ${
                          outlet.open
                            ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                            : "bg-destructive/15 text-destructive border border-destructive/30"
                        }`}
                        title="Click to toggle status"
                      >
                        {outlet.open ? "Open" : "Closed"}
                      </button>
                    </div>

                    {/* Operational Info */}
                    <div className="rounded-xl bg-secondary/30 p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" /> Hours:
                        </span>
                        <span className="font-semibold text-foreground">
                          {outlet.hours || "10:00 - 22:00"}
                        </span>
                      </div>

                      {outlet.phone && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" /> Contact:
                          </span>
                          <a
                            href={`https://wa.me/${cleanWhatsappNumber(outlet.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-emerald-600 hover:underline"
                          >
                            {outlet.phone}
                          </a>
                        </div>
                      )}

                      {outlet.mapsUrl && (
                        <div className="pt-1 border-t border-border/40">
                          <a
                            href={outlet.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <ExternalLink className="size-3" /> View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                      {!outlet.isMain ? (
                        <button
                          type="button"
                          onClick={() => handleSetMain(outlet.id)}
                          className="text-[11px] text-muted-foreground hover:text-primary transition cursor-pointer"
                        >
                          Set as Main HQ
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-primary">
                          Primary Kitchen HQ
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(outlet)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition cursor-pointer"
                          title="Edit Outlet"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(outlet)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition cursor-pointer"
                          title="Delete Outlet"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
