import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffPanel } from "@/components/dashboard/StaffPanel";

export const Route = createFileRoute("/owner/staff")({
  head: () => ({
    meta: [
      { title: "Staff & Accounts — Nanami Kitchen Owner Panel" },
      {
        name: "description",
        content:
          "Manage Nanami Kitchen team accounts: invite members, assign owner, admin, or staff roles, and configure user permissions.",
      },
      { property: "og:title", content: "Staff & Accounts — Nanami Kitchen Owner Panel" },
      {
        property: "og:description",
        content: "Manage team accounts and user permissions for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Staff & Accounts"
      subtitle="Manage roles and access permissions for owner, admin, staff, and customer accounts"
    >
      <StaffPanel />
    </DashboardShell>
  ),
});
