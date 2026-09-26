import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrderManagementPanel } from "@/components/dashboard/OrderManagementPanel";

export const Route = createFileRoute("/owner/orders")({
  head: () => ({
    meta: [
      { title: "Order Management — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage incoming orders, track preparation stages, filter by status, and search customers across the kitchen pipeline.",
      },
      { property: "og:title", content: "Order Management — Owner Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Scannable order workflow table with status management and customer search.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerOrdersPage,
});

function OwnerOrdersPage() {
  return (
    <DashboardShell
      role="owner"
      title="Order Management"
      subtitle="Search, track, and update active orders across the kitchen pipeline"
    >
      <OrderManagementPanel />
    </DashboardShell>
  );
}
