import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Tag,
  Ticket,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  actions,
  rupiah,
  uid,
  useStore,
  type Account,
  type Promo,
  type Voucher,
  type VoucherTargetType,
} from "@/lib/store";

export const Route = createFileRoute("/owner/vouchers")({
  head: () => ({
    meta: [
      { title: "Vouchers & Banners — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage discount vouchers and promotional banners. Share vouchers to all users or specific registered accounts.",
      },
      { property: "og:title", content: "Vouchers & Banners — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Discount vouchers and promo banners management for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VouchersPage,
});

interface VouchersPageState {
  vouchers: Voucher[];
  promos: Promo[];
}

function VouchersPage() {
  const globalVouchers = useStore((s) => s.vouchers);
  const globalPromos = useStore((s) => s.promos);
  const settings = useStore((s) => s.settings);
  const accounts = useStore((s) => s.accounts);

  // Filter only registered customer / user accounts
  const registeredUsers = useMemo(() => {
    return accounts.filter((a) => a.email);
  }, [accounts]);

  // Main 2-Menu Navigation: "Voucher" or "Banner"
  const [activeMenu, setActiveMenu] = useState<"voucher" | "banner">("voucher");

  const [localState, setLocalState] = useState<VouchersPageState>(() => ({
    vouchers: globalVouchers,
    promos: globalPromos,
  }));

  const [saving, setSaving] = useState(false);

  // Voucher Form State
  const [editingVoucherCode, setEditingVoucherCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("");
  const [targetType, setTargetType] = useState<VoucherTargetType>("all");
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Promo Banner Form State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");

  // Search filter for lists
  const [voucherSearch, setVoucherSearch] = useState("");
  const [bannerSearch, setBannerSearch] = useState("");

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localState);

  useEffect(() => {
    const nextState = {
      vouchers: globalVouchers,
      promos: globalPromos,
    };
    setLocalState(nextState);
    markSaved(nextState);
  }, [globalVouchers, globalPromos, markSaved]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Sync Vouchers
      const deletedVouchers = globalVouchers.filter(
        (gv) => !localState.vouchers.some((lv) => lv.code === gv.code),
      );
      for (const v of deletedVouchers) {
        await actions.deleteVoucher(v.code);
      }
      for (const v of localState.vouchers) {
        const gv = globalVouchers.find((x) => x.code === v.code);
        if (!gv || JSON.stringify(gv) !== JSON.stringify(v)) {
          await actions.saveVoucher(v);
        }
      }

      // 2. Sync Promos
      const deletedPromos = globalPromos.filter(
        (gp) => !localState.promos.some((lp) => lp.id === gp.id),
      );
      for (const p of deletedPromos) {
        await actions.deletePromo(p.id);
      }
      for (const p of localState.promos) {
        const gp = globalPromos.find((x) => x.id === p.id);
        if (!gp || JSON.stringify(gp) !== JSON.stringify(p)) {
          await actions.savePromo(p);
        }
      }

      markSaved(localState);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalState(snapshot);
  };

  // Filter users in target selector
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return registeredUsers;
    const q = userSearch.toLowerCase().trim();
    return registeredUsers.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q),
    );
  }, [registeredUsers, userSearch]);

  const handleToggleUserSelection = (email: string) => {
    const clean = email.trim().toLowerCase();
    setSelectedUserEmails((prev) =>
      prev.includes(clean) ? prev.filter((e) => e !== clean) : [...prev, clean],
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUserEmails(registeredUsers.map((u) => u.email.trim().toLowerCase()));
  };

  const handleDeselectAllUsers = () => {
    setSelectedUserEmails([]);
  };

  const resetVoucherForm = () => {
    setEditingVoucherCode(null);
    setCode("");
    setType("percent");
    setValue("");
    setMinSpend("");
    setTargetType("all");
    setSelectedUserEmails([]);
    setUserSearch("");
  };

  const handleEditVoucher = (v: Voucher) => {
    setEditingVoucherCode(v.code);
    setCode(v.code);
    setType(v.type);
    setValue(String(v.value));
    setMinSpend(String(v.minSpend || ""));
    setTargetType(v.targetType || "all");
    setSelectedUserEmails(v.targetUserEmails || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveVoucherToState = () => {
    if (!code || !Number(value)) return;

    const selectedIds = registeredUsers
      .filter((u) => selectedUserEmails.includes(u.email.trim().toLowerCase()))
      .map((u) => u.id);

    const newVoucher: Voucher = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minSpend: Number(minSpend) || 0,
      active: true,
      targetType,
      targetUserEmails: targetType === "specific" ? selectedUserEmails : [],
      targetUserIds: targetType === "specific" ? selectedIds : [],
    };

    setLocalState((prev) => {
      const filtered = editingVoucherCode
        ? prev.vouchers.filter((v) => v.code !== editingVoucherCode)
        : prev.vouchers.filter((v) => v.code !== newVoucher.code);
      return {
        ...prev,
        vouchers: [newVoucher, ...filtered],
      };
    });

    resetVoucherForm();
  };

  const resetPromoForm = () => {
    setEditingPromoId(null);
    setTitle("");
    setSubtitle("");
    setBadge("");
    setBannerImageUrl("");
  };

  const handleEditPromo = (p: Promo) => {
    setEditingPromoId(p.id);
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setBadge(p.badge);
    setBannerImageUrl(p.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSavePromoToState = () => {
    if (!title.trim()) return;

    const newPromo: Promo = {
      id: editingPromoId || uid(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim() || "Promo",
      imageUrl: bannerImageUrl.trim() || undefined,
      active: true,
    };

    setLocalState((prev) => {
      const filtered = editingPromoId
        ? prev.promos.filter((p) => p.id !== editingPromoId)
        : prev.promos;
      return {
        ...prev,
        promos: [newPromo, ...filtered],
      };
    });

    resetPromoForm();
  };

  // Filtered lists
  const filteredVouchersList = useMemo(() => {
    if (!voucherSearch.trim()) return localState.vouchers;
    const q = voucherSearch.toLowerCase().trim();
    return localState.vouchers.filter(
      (v) =>
        v.code.toLowerCase().includes(q) ||
        (v.targetUserEmails || []).some((e) => e.toLowerCase().includes(q)),
    );
  }, [localState.vouchers, voucherSearch]);

  const filteredPromosList = useMemo(() => {
    if (!bannerSearch.trim()) return localState.promos;
    const q = bannerSearch.toLowerCase().trim();
    return localState.promos.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q),
    );
  }, [localState.promos, bannerSearch]);

  return (
    <DashboardShell
      role="owner"
      title="Vouchers & Banners"
      subtitle="Manage discount codes, target user distribution, and promotional banners"
    >
      <div className="space-y-6 pb-24">
        {/* Top 2-Menu Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <button
            type="button"
            onClick={() => setActiveMenu("voucher")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              activeMenu === "voucher"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Ticket className="size-4" />
            <span>Vouchers Menu</span>
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
              {localState.vouchers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu("banner")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              activeMenu === "banner"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ImageIcon className="size-4" />
            <span>Banners Menu</span>
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
              {localState.promos.length}
            </span>
          </button>
        </div>

        {/* ===================== TAB 1: MENU VOUCHER ===================== */}
        {activeMenu === "voucher" && (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr] xl:items-start">
            {/* Left: Create / Edit Voucher Form */}
            <SectionCard
              title={editingVoucherCode ? "Edit Discount Voucher" : "Create New Voucher"}
              description="Create a new promo code and choose whether to distribute to all users or specific registered accounts."
            >
              {editingVoucherCode && (
                <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-semibold">
                  <span>Editing voucher: {editingVoucherCode}</span>
                  <button
                    type="button"
                    onClick={resetVoucherForm}
                    className="underline text-[11px] cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              <div className="space-y-3.5">
                <label className="block text-xs font-semibold text-foreground">
                  Voucher Code <span className="text-destructive">*</span>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className={`${fieldClass} font-mono font-bold tracking-wider`}
                    placeholder="e.g. DISCOUNT20 / VIPPROMO"
                  />
                </label>

                <label className="block text-xs font-semibold text-foreground">
                  Discount Type <span className="text-destructive">*</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "percent" | "fixed")}
                    className={fieldClass}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ({settings.currencySymbol || "N$"})</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Discount Value <span className="text-destructive">*</span>
                    <input
                      value={value}
                      inputMode="numeric"
                      onChange={(e) => setValue(e.target.value)}
                      className={fieldClass}
                      placeholder={type === "percent" ? "e.g. 20 (20%)" : "e.g. 50"}
                    />
                  </label>

                  <label className="block text-xs font-semibold text-foreground">
                    Minimum Spend
                    <input
                      value={minSpend}
                      inputMode="numeric"
                      onChange={(e) => setMinSpend(e.target.value)}
                      className={fieldClass}
                      placeholder="e.g. 100"
                    />
                  </label>
                </div>

                {/* Target Voucher Distribution (All vs Specific) */}
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5 space-y-3">
                  <label className="block text-xs font-bold text-foreground">
                    Share / Distribute Voucher To:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType("all")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition cursor-pointer ${
                        targetType === "all"
                          ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Globe className="size-4" />
                      <span className="text-xs">All Users</span>
                      <span className="text-[10px] opacity-80">Public & Registered</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType("specific")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition cursor-pointer ${
                        targetType === "specific"
                          ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <UserCheck className="size-4" />
                      <span className="text-xs">Specific Users</span>
                      <span className="text-[10px] opacity-80">
                        {selectedUserEmails.length} user{selectedUserEmails.length === 1 ? "" : "s"}{" "}
                        selected
                      </span>
                    </button>
                  </div>

                  {/* Specific Users Selector List */}
                  {targetType === "specific" && (
                    <div className="space-y-2 pt-2 border-t border-primary/20">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-foreground">
                          Select User Accounts ({selectedUserEmails.length} selected):
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={handleSelectAllUsers}
                            className="text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          <span>&bull;</span>
                          <button
                            type="button"
                            onClick={handleDeselectAllUsers}
                            className="text-muted-foreground hover:underline font-semibold cursor-pointer"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      {/* User Search Input */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search name, email, or phone..."
                          className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary"
                        />
                      </div>

                      {/* User Checkbox List */}
                      <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-border bg-background p-2">
                        {filteredUsers.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground text-center py-4">
                            No registered users found.
                          </p>
                        ) : (
                          filteredUsers.map((user) => {
                            const isSelected = selectedUserEmails.includes(
                              user.email.trim().toLowerCase(),
                            );
                            return (
                              <label
                                key={user.id}
                                className={`flex items-center gap-2.5 rounded-lg p-2 transition cursor-pointer ${
                                  isSelected ? "bg-primary/10" : "hover:bg-secondary/50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleUserSelection(user.email)}
                                  className="size-4 accent-primary rounded cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-foreground truncate">
                                      {user.name || "Customer"}
                                    </p>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                      {user.role || "user"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {user.email} {user.phone ? `· ${user.phone}` : ""}
                                  </p>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={
                      !code.trim() ||
                      !Number(value) ||
                      (targetType === "specific" && selectedUserEmails.length === 0)
                    }
                    onClick={handleSaveVoucherToState}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition cursor-pointer shadow-sm"
                  >
                    <Check className="size-4" />
                    <span>{editingVoucherCode ? "Save Voucher Changes" : "Add Voucher"}</span>
                  </button>
                  {editingVoucherCode && (
                    <button
                      type="button"
                      onClick={resetVoucherForm}
                      className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Right: Voucher List Section */}
            <SectionCard
              title="Store Vouchers List"
              description={`Total of ${localState.vouchers.length} vouchers configured in the system.`}
            >
              {/* Search vouchers */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                  placeholder="Search voucher code or assigned user email..."
                  className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
                />
                {voucherSearch && (
                  <button
                    type="button"
                    onClick={() => setVoucherSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {filteredVouchersList.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-border p-6">
                  <Ticket className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No vouchers found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a new discount voucher using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredVouchersList.map((v) => {
                    const isSpecific = v.targetType === "specific";
                    const specificCount = (v.targetUserEmails || []).length;

                    return (
                      <div
                        key={v.code}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 hover:shadow-sm transition"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-black text-foreground">
                              {v.code}
                            </span>
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                              {v.type === "percent" ? `${v.value}% OFF` : `${rupiah(v.value)} OFF`}
                            </span>

                            {/* Target Sharing Badge */}
                            {isSpecific ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                                <UserCheck className="size-3" /> {specificCount} Specific User
                                {specificCount === 1 ? "" : "s"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                <Globe className="size-3" /> All Users
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {v.minSpend > 0
                              ? `Min. spend: ${rupiah(v.minSpend)}`
                              : "No minimum spend"}
                          </p>

                          {isSpecific && (v.targetUserEmails || []).length > 0 && (
                            <p className="text-[10px] text-purple-600/90 font-medium truncate max-w-md">
                              Users: {v.targetUserEmails?.join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                          {/* Toggle Active Status */}
                          <button
                            type="button"
                            onClick={() => {
                              setLocalState((prev) => ({
                                ...prev,
                                vouchers: prev.vouchers.map((x) =>
                                  x.code === v.code ? { ...x, active: !x.active } : x,
                                ),
                              }));
                            }}
                            className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                              v.active
                                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                : "bg-destructive/15 text-destructive border border-destructive/30"
                            }`}
                          >
                            {v.active ? "Active" : "Inactive"}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleEditVoucher(v)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                            title="Edit Voucher"
                          >
                            <Pencil className="size-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete voucher ${v.code}?`)) {
                                setLocalState((prev) => ({
                                  ...prev,
                                  vouchers: prev.vouchers.filter((x) => x.code !== v.code),
                                }));
                              }
                            }}
                            aria-label={`Delete ${v.code}`}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ===================== TAB 2: MENU BANNER ===================== */}
        {activeMenu === "banner" && (
          <div className="grid gap-6 xl:grid-cols-[400px_1fr] xl:items-start">
            {/* Left: Create / Edit Banner Form */}
            <SectionCard
              title={editingPromoId ? "Edit Promo Banner" : "Create New Banner"}
              description="Manage promotional banner cards that appear on the customer home screen."
            >
              {editingPromoId && (
                <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-semibold">
                  <span>Editing banner</span>
                  <button
                    type="button"
                    onClick={resetPromoForm}
                    className="underline text-[11px] cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              <div className="space-y-3.5">
                <label className="block text-xs font-semibold text-foreground">
                  Banner Title <span className="text-destructive">*</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. 20% OFF All Bento Sets"
                  />
                </label>

                <label className="block text-xs font-semibold text-foreground">
                  Subtitle / Description
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. Use promo code NANAMI20 at checkout"
                  />
                </label>

                <label className="block text-xs font-semibold text-foreground">
                  Badge / Tag Label
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. Promo / Special Deal / Delivery"
                  />
                </label>

                <label className="block text-xs font-semibold text-foreground">
                  Banner Image URL (Optional)
                  <input
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. /assets/hero.jpg or https://..."
                  />
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    disabled={!title.trim()}
                    onClick={handleSavePromoToState}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition cursor-pointer shadow-sm"
                  >
                    <Check className="size-4" />
                    <span>{editingPromoId ? "Save Banner" : "Add Banner"}</span>
                  </button>
                  {editingPromoId && (
                    <button
                      type="button"
                      onClick={resetPromoForm}
                      className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Right: Banner List Section */}
            <SectionCard
              title="Active Promo Banners"
              description={`Total of ${localState.promos.length} active banners displayed on the customer app carousel.`}
            >
              {/* Search banner */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={bannerSearch}
                  onChange={(e) => setBannerSearch(e.target.value)}
                  placeholder="Search banner title or badge..."
                  className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
                />
                {bannerSearch && (
                  <button
                    type="button"
                    onClick={() => setBannerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {filteredPromosList.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-border p-6">
                  <ImageIcon className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No promo banners found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a new promotional banner to show on the customer home screen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPromosList.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="size-16 rounded-xl object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Tag className="size-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {p.title}
                            </h4>
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</p>
                          {p.imageUrl && (
                            <p className="text-[10px] text-muted-foreground/70 truncate mt-1">
                              URL: {p.imageUrl}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                        <button
                          type="button"
                          onClick={() => handleEditPromo(p)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                          title="Edit Banner"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete banner "${p.title}"?`)) {
                              setLocalState((prev) => ({
                                ...prev,
                                promos: prev.promos.filter((x) => x.id !== p.id),
                              }));
                            }
                          }}
                          aria-label={`Delete ${p.title}`}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
