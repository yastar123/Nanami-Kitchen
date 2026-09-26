import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffPanel } from "@/components/dashboard/StaffPanel";

export const Route = createFileRoute("/owner/staff")({
  head: () => ({
    meta: [
      { title: "Akun & Staf — Panel Pemilik Nanami Kitchen" },
      {
        name: "description",
        content:
          "Kelola akun tim Nanami Kitchen: undang anggota, tetapkan peran pemilik, admin, atau staf, dan atur hak akses pengguna.",
      },
      { property: "og:title", content: "Akun & Staf — Panel Pemilik Nanami Kitchen" },
      {
        property: "og:description",
        content: "Kelola akun tim dan hak akses pengguna untuk Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Akun & Staf"
      subtitle="Kelola peran dan hak akses akun pemilik, admin, staf, serta pelanggan"
    >
      <StaffPanel />
    </DashboardShell>
  ),
});
