import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  Coins,
  LayoutTemplate,
  Plus,
  ShieldCheck,
  Store,
  Ticket,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { DashboardShell, StatCard } from "@/components/dashboard/DashboardShell";
import { KitchenBoard } from "@/components/dashboard/KitchenBoard";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Management Dashboard — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Full application administration panel: manage menu items (CRUD), orders, vouchers, outlets, staff accounts, and kitchen operations.",
      },
      { property: "og:title", content: "Admin Dashboard — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Manage the entire Nanami Kitchen platform with full CRUD controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { menu, orders, vouchers, staff, settings } = useStore((s) => ({
    menu: s.menu,
    orders: s.orders,
    vouchers: s.vouchers,
    staff: s.staff,
    settings: s.settings,
  }));

  const outlets = [
    {
      id: "1",
      name: "Nanami Kitchen Main Store",
      address: "12 Rosebank Road, Rosebank, Johannesburg",
      hours: "10:00 - 22:00",
      open: true,
    },
    {
      id: "2",
      name: "Nanami Kitchen Sandton Branch",
      address: "Building 4, Sandton City, Sandton",
      hours: "11:00 - 21:00",
      open: false,
    },
  ];

  const [activeTab, setActiveTab] = useState<"kitchen" | "crud">("crud");

  const soldOut = menu.filter((m) => !m.available).length;
  const activeMenuCount = menu.filter((m) => m.available).length;
  const activeOrders = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== "Cancelled" ? sum + o.total : sum),
    0,
  );

  return (
    <DashboardShell
      role="admin"
      title="Admin Management Dashboard"
      subtitle={settings.storeOpen ? "Store is currently open for orders" : "Store is closed"}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/menu"
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            <Plus className="size-3.5" /> Add Menu Item
          </Link>
          <Link
            to="/owner/vouchers"
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70"
          >
            <Ticket className="size-3.5" /> Create Voucher
          </Link>
        </div>
      }
    >
      {/* Stat Cards Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={rupiah(totalRevenue)}
          hint={`${orders.length} total orders recorded`}
        />
        <StatCard
          label="Active Menu Items"
          value={`${activeMenuCount} items`}
          hint={soldOut > 0 ? `${soldOut} items currently sold out` : "All menu items in stock"}
        />
        <StatCard
          label="Active Kitchen Orders"
          value={`${activeOrders.length} pending`}
          hint="Orders being prepared or delivered"
        />
        <StatCard
          label="Registered Vouchers & Outlets"
          value={`${vouchers.length} Promos · ${outlets.length} Outlets`}
          hint={`${staff.length} staff accounts managed`}
        />
      </div>

      {/* View Switcher Tabs */}
      <div className="mt-6 flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("crud")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "crud"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <UtensilsCrossed className="size-4" /> Application CRUD Modules
          </button>
          <button
            onClick={() => setActiveTab("kitchen")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "kitchen"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <ChefHat className="size-4" /> Kitchen Order Pipeline ({activeOrders.length})
          </button>
        </div>

        {soldOut > 0 && (
          <Link
            to="/admin/stock"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive"
          >
            ⚠️ {soldOut} Item(s) Sold Out
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "crud" ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Menu & Catalog CRUD */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <UtensilsCrossed className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Menu & Catalog CRUD</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create, update, edit prices, set prep times, add variant toppings, and delete food
                  & drink items.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>Total: {menu.length} Items</span> &bull;{" "}
                  <span>{activeMenuCount} Available</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/admin/menu"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                >
                  Manage & CRUD Menu
                </Link>
                <Link
                  to="/admin/stock"
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary"
                >
                  Stock Toggle
                </Link>
              </div>
            </div>

            {/* Card 2: Vouchers & Promos CRUD */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <Ticket className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Vouchers & Promos (CRUD)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create custom discount codes, set percentage or fixed discounts, minimum spend,
                  and expiry dates.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>{vouchers.length} Promo Codes Active</span>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/owner/vouchers"
                  className="block w-full rounded-xl bg-amber-500 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:opacity-90"
                >
                  Manage Vouchers & Promos
                </Link>
              </div>
            </div>

            {/* Card 3: Content & CMS */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
                  <LayoutTemplate className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Content & Store CMS</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customize storefront logo, banners, hero text, store slogans, announcement bars,
                  and FAQs.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>Full Live Customization</span>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/owner/cms"
                  className="block w-full rounded-xl bg-purple-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:opacity-90"
                >
                  Open CMS Editor
                </Link>
              </div>
            </div>

            {/* Card 4: Orders & Fulfillment Pipeline */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
                  <ClipboardList className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Daily Orders & Dispatch</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  View incoming orders, change statuses, manage dispatch stages, and review order
                  history.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>{orders.length} Total Orders</span> &bull;{" "}
                  <span>{activeOrders.length} Active</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/admin/orders"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:opacity-90"
                >
                  View Orders List
                </Link>
                <button
                  onClick={() => setActiveTab("kitchen")}
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary"
                >
                  Kitchen Board
                </button>
              </div>
            </div>

            {/* Card 5: Outlets & Delivery Rates */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                  <Store className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Outlets & Delivery Rates</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add branch outlets, set opening hours, set up base delivery fees and per-km
                  distance rates.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>{outlets.length} Active Branches</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/owner/outlets"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:opacity-90"
                >
                  Outlets Directory
                </Link>
                <Link
                  to="/owner/shipping"
                  className="flex-1 rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-xs font-semibold hover:bg-secondary"
                >
                  Delivery Rates
                </Link>
              </div>
            </div>

            {/* Card 6: Staff Accounts & Security */}
            <div className="glow-card flex flex-col justify-between p-5 transition hover:border-primary/50">
              <div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="mt-3 text-base font-bold">Staff Accounts & Security</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create and manage staff logins, assign roles (Admin, Kitchen, Owner), and manage
                  store operations.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span>{staff.length} Accounts Configured</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/owner/staff"
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:opacity-90"
                >
                  Manage Staff
                </Link>
                <Link
                  to="/admin/settings"
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <KitchenBoard />
        </div>
      )}
    </DashboardShell>
  );
}
