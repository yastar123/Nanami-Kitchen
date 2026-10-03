import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Ticket, UserCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, cartTotals, discountFor, findVoucher, rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/vouchers")({
  head: () => ({
    meta: [
      { title: "Vouchers & Promos — Nanami Kitchen" },
      {
        name: "description",
        content: "Apply promo codes and browse available Nanami Kitchen vouchers.",
      },
      { property: "og:title", content: "Vouchers & Promos — Nanami Kitchen" },
      { property: "og:description", content: "Apply promo codes and browse available vouchers." },
    ],
  }),
  component: Vouchers,
});

function Vouchers() {
  const { vouchers, voucherCode, cart, profile, settings } = useStore((s) => ({
    vouchers: s.vouchers,
    voucherCode: s.voucherCode,
    cart: s.cart,
    profile: s.profile,
    settings: s.settings,
  }));
  const { subtotal } = cartTotals(cart);
  const [code, setCode] = useState(voucherCode);
  const [error, setError] = useState("");

  const userEmail = (profile?.email || "").trim().toLowerCase();
  const userId = profile?.id || "";

  // Filter vouchers that are active and eligible for the user
  const eligibleVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (!v.active) return false;
      if (!v.targetType || v.targetType === "all") return true;
      if (v.targetType === "specific") {
        const matchEmail = (v.targetUserEmails || []).some(
          (e) => e.trim().toLowerCase() === userEmail,
        );
        const matchId = (v.targetUserIds || []).some((id) => id === userId);
        return matchEmail || matchId;
      }
      return true;
    });
  }, [vouchers, userEmail, userId]);

  function apply(value: string) {
    const voucher = findVoucher(vouchers, value);
    if (!voucher) {
      setError("Invalid voucher code.");
      return;
    }

    // Check specific user eligibility
    if (voucher.targetType === "specific") {
      const matchEmail = (voucher.targetUserEmails || []).some(
        (e) => e.trim().toLowerCase() === userEmail,
      );
      const matchId = (voucher.targetUserIds || []).some((id) => id === userId);
      if (!matchEmail && !matchId) {
        setError("This voucher is exclusive to specific users.");
        return;
      }
    }

    if (subtotal > 0 && subtotal < voucher.minSpend) {
      setError(`Minimum spend for this voucher is ${rupiah(voucher.minSpend)}.`);
      return;
    }

    setError("");
    setCode(voucher.code);
    actions.setVoucherCode(voucher.code);
  }

  return (
    <AppShell hideCartBar>
      <div className="flex items-center gap-4 pt-2">
        <Link to="/profile" aria-label="Back" className="rounded-full p-1 text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-2xl font-bold">Vouchers & Promos</h1>
      </div>

      <div className="glow-card mt-6 flex items-center gap-3 p-4">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">{profile.points} loyalty points</p>
          <p className="text-xs text-muted-foreground">
            Earn {settings.pointsPer10k} point(s) for every {settings.currencySymbol || "N$"} 100
            spent.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="min-w-0 flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm uppercase outline-none focus:border-primary font-mono font-bold"
        />
        <button
          onClick={() => apply(code)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground cursor-pointer hover:opacity-90"
        >
          Apply
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {voucherCode && !error && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 text-emerald-600 px-3 py-2 text-xs font-semibold">
          <Check className="size-3.5" /> Voucher {voucherCode} applied
          {subtotal > 0 &&
            ` — save ${rupiah(discountFor(subtotal, findVoucher(vouchers, voucherCode)))}`}
        </p>
      )}

      <h2 className="mt-7 text-lg font-semibold">Available Vouchers</h2>
      <div className="mt-3 space-y-3">
        {eligibleVouchers.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No vouchers available at the moment.
          </p>
        )}
        {eligibleVouchers.map((v) => {
          const isTargeted = v.targetType === "specific";

          return (
            <div key={v.code} className="glow-card flex items-center gap-4 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Ticket className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">
                    {v.type === "percent" ? `${v.value}% OFF` : `${rupiah(v.value)} OFF`}
                  </p>
                  {isTargeted && (
                    <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 text-purple-600 text-[10px] font-bold px-1.5 py-0.5">
                      <UserCheck className="size-3" /> Exclusive to You
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Code: <span className="font-bold text-foreground">{v.code}</span>
                  {v.minSpend > 0 ? ` · min. spend ${rupiah(v.minSpend)}` : " · no minimum"}
                </p>
              </div>
              <button
                onClick={() => apply(v.code)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  voucherCode === v.code
                    ? "bg-emerald-500/20 text-emerald-600"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {voucherCode === v.code ? "Applied" : "Use"}
              </button>
            </div>
          );
        })}
      </div>

      <Link
        to="/cart"
        className="mt-7 block rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground hover:opacity-90 transition"
      >
        Back to Cart
      </Link>
    </AppShell>
  );
}
