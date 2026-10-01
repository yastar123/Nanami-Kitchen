import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, Minus, Plus, Share2, Sparkles, Ticket, X } from "lucide-react";
import {
  actions,
  discountFor,
  findVoucher,
  handleImageError,
  resolveMenuImage,
  rupiah,
  useStore,
  type MenuItem,
  type Voucher,
} from "@/lib/store";

export function ProductSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const groups = useMemo(
    () => (item.groups || []).filter((g) => g.enabled !== false),
    [item.groups],
  );

  const vouchers = useStore((s) => s.vouchers);
  const currentVoucherCode = useStore((s) => s.voucherCode);
  const profile = useStore((s) => s.profile);

  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    groups.forEach((g) => {
      init[g.id] = g.type === "single" ? [(g.choices || [])[0]?.id ?? ""] : [];
    });
    return init;
  });
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  // Optional voucher input state
  const [inputVoucher, setInputVoucher] = useState(currentVoucherCode || "");
  const [voucherError, setVoucherError] = useState("");
  const [showVoucherList, setShowVoucherList] = useState(false);

  const { unitPrice, labels } = useMemo(() => {
    let price = item.price || 0;
    const lbls: string[] = [];
    groups.forEach((g) => {
      (selected[g.id] ?? []).forEach((cid) => {
        const c = (g.choices || []).find((x) => x.id === cid);
        if (c) {
          price += Number(c.price) || 0;
          lbls.push(c.name);
        }
      });
    });
    return { unitPrice: price, labels: lbls };
  }, [item, selected, groups]);

  // Filter available vouchers for this user
  const eligibleVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (!v.active) return false;
      if (!v.targetType || v.targetType === "all") return true;
      if (v.targetType === "specific") {
        const userEmail = (profile?.email || "").trim().toLowerCase();
        const userId = profile?.id || "";
        const matchEmail = (v.targetUserEmails || []).some(
          (e) => e.trim().toLowerCase() === userEmail,
        );
        const matchId = (v.targetUserIds || []).some((id) => id === userId);
        return matchEmail || matchId;
      }
      return true;
    });
  }, [vouchers, profile]);

  const activeVoucherObj = useMemo(() => {
    if (!currentVoucherCode) return null;
    return findVoucher(vouchers, currentVoucherCode);
  }, [vouchers, currentVoucherCode]);

  const subtotalItem = unitPrice * qty;
  const potentialDiscount = activeVoucherObj ? discountFor(subtotalItem, activeVoucherObj) : 0;

  function toggle(groupId: string, type: "single" | "multi", choiceId: string) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (type === "single") return { ...prev, [groupId]: [choiceId] };
      return {
        ...prev,
        [groupId]: current.includes(choiceId)
          ? current.filter((c) => c !== choiceId)
          : [...current, choiceId],
      };
    });
  }

  function handleApplyVoucher(codeToApply: string) {
    const clean = codeToApply.trim().toUpperCase();
    if (!clean) {
      actions.setVoucherCode("");
      setInputVoucher("");
      setVoucherError("");
      return;
    }

    const matched = findVoucher(vouchers, clean);
    if (!matched) {
      setVoucherError("Kode voucher tidak valid.");
      return;
    }

    // Check specific target user eligibility
    if (matched.targetType === "specific") {
      const userEmail = (profile?.email || "").trim().toLowerCase();
      const userId = profile?.id || "";
      const matchEmail = (matched.targetUserEmails || []).some(
        (e) => e.trim().toLowerCase() === userEmail,
      );
      const matchId = (matched.targetUserIds || []).some((id) => id === userId);
      if (!matchEmail && !matchId) {
        setVoucherError("Voucher ini eksklusif untuk pengguna tertentu.");
        return;
      }
    }

    setVoucherError("");
    setInputVoucher(matched.code);
    actions.setVoucherCode(matched.code);
  }

  function handleRemoveVoucher() {
    actions.setVoucherCode("");
    setInputVoucher("");
    setVoucherError("");
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.origin + "/menu" : "";
    const text = `Check out ${item.name} at Nanami Kitchen — ${rupiah(item.price)} ${url}`;
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl bg-popover pb-6 shadow-2xl border-t border-x border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={resolveMenuImage(item.image)}
            alt={item.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e)}
            className="h-48 w-full rounded-t-3xl object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-4 sm:px-6 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold">{item.name}</h2>
              <button
                onClick={share}
                aria-label="Share"
                className="rounded-full bg-secondary p-2 hover:bg-secondary/80 transition cursor-pointer"
              >
                <Share2 className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{item.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Prep {item.prepMinutes || 15} mins + delivery ~20 mins
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {(item.badges || []).map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Option Groups */}
          {groups.map((g) => (
            <div key={g.id}>
              <h3 className="text-xs sm:text-sm font-semibold">
                {g.name}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {g.type === "single" ? "Choose one" : "Optional"}
                </span>
              </h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(g.choices || []).map((c) => {
                  const active = (selected[g.id] ?? []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(g.id, g.type, c.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                        active
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="truncate mr-2">{c.name}</span>
                      <span className="shrink-0">{c.price > 0 ? `+ ${rupiah(c.price)}` : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Request */}
          {item.specialRequestEnabled !== false && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold">Catatan Khusus (Opsional)</h3>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: jangan terlalu pedas, kuah dipisah"
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Optional Voucher Input Section */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Ticket className="size-3.5 text-primary" />
                <span>Voucher Diskon</span>
                <span className="text-[10px] font-normal text-muted-foreground">(Opsional)</span>
              </label>

              {eligibleVouchers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowVoucherList((p) => !p)}
                  className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{eligibleVouchers.length} voucher tersedia</span>
                  <ChevronDown
                    className={`size-3 transition-transform ${showVoucherList ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>

            {/* Voucher Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVoucher}
                onChange={(e) => {
                  setInputVoucher(e.target.value.toUpperCase());
                  setVoucherError("");
                }}
                placeholder="Masukkan kode promo (e.g. NANAMI20)"
                className="flex-1 uppercase rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-bold tracking-wider outline-none focus:border-primary"
              />
              {currentVoucherCode ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition cursor-pointer"
                >
                  Hapus
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputVoucher.trim()}
                  onClick={() => handleApplyVoucher(inputVoucher)}
                  className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
                >
                  Pakai
                </button>
              )}
            </div>

            {/* Error Message */}
            {voucherError && (
              <p className="text-[11px] text-destructive font-medium">{voucherError}</p>
            )}

            {/* Applied Confirmation Badge */}
            {currentVoucherCode && activeVoucherObj && !voucherError && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Check className="size-3.5" /> Voucher <strong>{currentVoucherCode}</strong> aktif
                </span>
                {potentialDiscount > 0 && (
                  <span className="text-[11px] font-bold">Hemat {rupiah(potentialDiscount)}</span>
                )}
              </div>
            )}

            {/* Quick Picker Dropdown from /vouchers */}
            {showVoucherList && eligibleVouchers.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-primary/15 mt-2">
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Klik untuk menggunakan voucher:
                </p>
                <div className="grid gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {eligibleVouchers.map((v) => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => {
                        handleApplyVoucher(v.code);
                        setShowVoucherList(false);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-2 text-left transition cursor-pointer ${
                        currentVoucherCode === v.code
                          ? "border-primary bg-primary/15"
                          : "border-border bg-background hover:bg-secondary/60"
                      }`}
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-foreground">{v.code}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {v.type === "percent" ? `${v.value}% OFF` : `${rupiah(v.value)} OFF`}
                          {v.minSpend > 0 ? ` · min ${rupiah(v.minSpend)}` : " · tanpa minimum"}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-primary">
                        {currentVoucherCode === v.code ? "Terpasang" : "Gunakan"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border px-2.5 sm:px-3 py-2 shrink-0">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="p-0.5 hover:text-primary transition cursor-pointer"
              >
                <Minus className="size-3.5 sm:size-4" />
              </button>
              <span className="w-5 text-center text-xs sm:text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase"
                className="p-0.5 hover:text-primary transition cursor-pointer"
              >
                <Plus className="size-3.5 sm:size-4" />
              </button>
            </div>
            <button
              onClick={() => {
                actions.addToCart({
                  itemId: item.id,
                  name: item.name,
                  unitPrice,
                  qty,
                  optionLabels: labels,
                  note,
                });
                onClose();
              }}
              className="flex-1 rounded-xl bg-primary py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-bold text-primary-foreground hover:brightness-105 transition truncate cursor-pointer shadow-sm"
            >
              Add to Cart · {rupiah(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
