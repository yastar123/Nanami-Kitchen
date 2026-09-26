import { useEffect, useState } from "react";
import defaultHeroImg from "@/assets/hero.jpg";
import { useStore, resolveMenuImage } from "@/lib/store";

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const cms = useStore((s) => s.cms);

  const splashSrc = cms?.welcomeScreen?.imageUrl
    ? resolveMenuImage(cms.welcomeScreen.imageUrl, defaultHeroImg)
    : defaultHeroImg;

  useEffect(() => {
    // Measure how long the user has ALREADY been seeing the splash screen since navigation started
    const navStart =
      (typeof window !== "undefined" && (window as any).__nanami_nav_start) ||
      (typeof performance !== "undefined" && performance.timeOrigin
        ? performance.timeOrigin
        : Date.now());
    const elapsed = Math.max(0, Date.now() - navStart);

    // Target TOTAL splash display time: configured duration (default ~1.5s, max 4s)
    const configuredTarget = (cms?.welcomeScreen?.durationSec ?? 1.5) * 1000;
    const targetTotal = Math.min(4000, Math.max(800, configuredTarget));

    // Calculate remaining duration before initiating smooth exit
    const remainingMs = Math.max(200, targetTotal - elapsed);

    const t = setTimeout(() => setLeaving(true), remainingMs);
    return () => clearTimeout(t);
  }, [cms?.welcomeScreen?.durationSec]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 300);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      id="welcome-screen-overlay"
      onClick={() => setLeaving(true)}
      role="button"
      tabIndex={0}
      aria-label="Welcome splash screen (tap anywhere to skip)"
      className={`fixed inset-0 z-[100] flex h-[100dvh] w-screen cursor-pointer select-none items-center justify-center overflow-hidden bg-black transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100 animate-in fade-in duration-300"
      }`}
    >
      <img
        src={splashSrc}
        alt="Nanami Kitchen Welcome Splash"
        loading="eager"
        decoding="sync"
        className="h-full w-full object-cover object-center pointer-events-none select-none"
      />

      {/* Subtle bottom skip hint */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
        <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md shadow-lg border border-white/10">
          Tap anywhere to continue &rarr;
        </span>
      </div>
    </div>
  );
}
