import { useEffect, useState } from "react";
import defaultLogo from "@/assets/nanami-logo.png";
import defaultHeroImg from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const cms = useStore((s) => s.cms);

  // Keep duration snappy: between 1.2s and 2.0s (default 1.8s) so total load feel is under 3s
  const durationMs = Math.min(
    2000,
    Math.max(1000, (cms?.welcomeScreen?.durationSec ?? 1.8) * 1000),
  );
  const logoSrc = cms?.logoUrl || defaultLogo;
  const heroSrc = cms?.welcomeScreen?.imageUrl || cms?.heroImage || defaultHeroImg;
  const title = cms?.welcomeScreen?.title || cms?.brandName || "nanami";
  const subtitle = cms?.welcomeScreen?.subtitle || cms?.brandSuffix || "kitchen";
  const slogan = cms?.welcomeScreen?.slogan || "Good Food.\nMade with Love";

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 300);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      onClick={() => setLeaving(true)}
      role="button"
      tabIndex={0}
      aria-label="Welcome screen (click to continue)"
      className={`fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-between overflow-hidden bg-[oklch(0.16_0.01_60)] transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-16 text-center">
        <img
          src={logoSrc}
          alt="Nanami Kitchen logo"
          width={816}
          height={816}
          className="h-28 w-28 rounded-2xl object-contain animate-in fade-in zoom-in-95 duration-700"
        />
        <h1 className="mt-4 font-display text-5xl italic tracking-tight text-[oklch(0.82_0.12_85)]">
          {title}
        </h1>
        <p className="mt-1 text-xl font-medium uppercase tracking-[0.45em] text-[oklch(0.82_0.12_85)]">
          {subtitle}
        </p>
        <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-[oklch(0.92_0.01_80)]">
          {slogan}
        </p>
      </div>

      <div className="relative h-[42vh] w-full">
        <img
          src={heroSrc}
          alt="Signature bowl from Nanami Kitchen"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.01_60)] via-transparent to-transparent" />
      </div>
    </div>
  );
}
