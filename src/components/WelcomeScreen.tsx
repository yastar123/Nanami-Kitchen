import { useEffect, useState } from "react";
import defaultLogo from "@/assets/nanami-logo.png";
import defaultHeroImg from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const cms = useStore((s) => s.cms);

  const logoSrc = cms?.logoUrl || defaultLogo;
  const heroSrc = cms?.welcomeScreen?.imageUrl || defaultHeroImg;
  const title = cms?.welcomeScreen?.title || cms?.brandName || "nanami";
  const subtitle = cms?.welcomeScreen?.subtitle || cms?.brandSuffix || "kitchen";
  const slogan = cms?.welcomeScreen?.slogan || "Good Food.\nMade with Love";

  useEffect(() => {
    // Measure how long the user has ALREADY been seeing the splash screen since navigation started
    const navStart =
      (typeof window !== "undefined" && (window as any).__nanami_nav_start) ||
      (typeof performance !== "undefined" && performance.timeOrigin
        ? performance.timeOrigin
        : Date.now());
    const elapsed = Math.max(0, Date.now() - navStart);

    // Target TOTAL splash display time: capped strictly between 600ms and 1200ms
    // This guarantees total time from page request to home screen is always under 1.5s - 1.8s
    const configuredTarget = (cms?.welcomeScreen?.durationSec ?? 1.0) * 1000;
    const targetTotal = Math.min(1200, Math.max(600, configuredTarget));

    // Calculate remaining duration before initiating smooth exit
    const remainingMs = Math.max(150, targetTotal - elapsed);

    const t = setTimeout(() => setLeaving(true), remainingMs);
    return () => clearTimeout(t);
  }, [cms?.welcomeScreen?.durationSec]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 200);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      id="welcome-screen-overlay"
      onClick={() => setLeaving(true)}
      role="button"
      tabIndex={0}
      aria-label="Welcome screen (click to continue)"
      className={`fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-between overflow-hidden bg-[oklch(0.16_0.01_60)] transition-opacity duration-200 ${
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
