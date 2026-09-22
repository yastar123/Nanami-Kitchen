import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  MessageCircle,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PromoCarousel } from "@/components/PromoCarousel";
import { ProductSheet } from "@/components/ProductSheet";
import {
  actions,
  CATEGORIES,
  getAvailableCategories,
  defaultCmsContent,
  rupiah,
  useStore,
  resolveMenuImage,
  handleImageError,
  type MenuItem,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nanami Kitchen — Order Food Delivery & Pickup" },
      {
        name: "description",
        content:
          "Order Nanami Kitchen bento, geprek, snacks and drinks. Fast pickup or delivery with easy WhatsApp checkout.",
      },
      { property: "og:title", content: "Nanami Kitchen — Order Food Delivery & Pickup" },
      {
        property: "og:description",
        content: "Good food, made with love. Order in seconds for pickup or delivery.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { orderType, menu, settings, cms } = useStore((s) => ({
    orderType: s.orderType,
    menu: s.menu,
    settings: s.settings,
    cms: s.cms || defaultCmsContent,
  }));
  const [active, setActive] = useState<MenuItem | null>(null);

  // Show Welcome Screen on initial site load / refresh unless disabled in CMS
  const [showWelcome, setShowWelcome] = useState(() => cms.welcomeScreen?.enabled !== false);

  const handleWelcomeDone = () => {
    setShowWelcome(false);
  };

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<string>("must-try");
  const isScrollingRef = useRef(false);

  const activeFaqs = (cms.faqs || []).filter((f) => f.active);
  const categoryOrder = getAvailableCategories(cms, menu);
  const categoryNames = cms.categoryNames || {};
  const mustTryIds = cms.mustTryItemIds || ["m1", "m2", "m3", "m4"];
  const mustTryItems = menu.filter((m) => mustTryIds.includes(m.id) && m.available);
  const displayMustTry =
    mustTryItems.length > 0 ? mustTryItems : menu.filter((m) => m.available).slice(0, 4);

  useEffect(() => {
    if (cms.welcomeScreen?.enabled === false && showWelcome) {
      setShowWelcome(false);
    }
  }, [cms.welcomeScreen?.enabled, showWelcome]);

  // ScrollSpy with IntersectionObserver (Spec-compliant)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-section-id");
          if (id) {
            console.log("[ScrollSpy IntersectionObserver] activeTab changed to:", id);
            setActiveTab(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll(".scrollspy-section");
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
      observer.disconnect();
    };
  }, [categoryOrder]);

  const scrollToSection = (id: string) => {
    console.log("[scrollToSection] clicked tab ID:", id, "| activeTab before:", activeTab);
    isScrollingRef.current = true;
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
      console.log("[scrollToSection] scroll lock released, activeTab is:", id);
    }, 600);
  };

  return (
    <AppShell>
      {showWelcome && <WelcomeScreen onDone={handleWelcomeDone} />}

      {/* Full-width Hero Banner pinned to top */}
      <div className="-mx-3 -mt-3">
        <PromoCarousel />
      </div>

      {/* Dynamic Running Announcement Bar */}
      {cms.announcement?.enabled && cms.announcement.text && (
        <div
          className={`mt-2 flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs transition ${
            cms.announcement.type === "promo"
              ? "border border-amber-500/30 bg-amber-500/15 text-amber-900 dark:text-amber-200"
              : cms.announcement.type === "warning"
                ? "border border-destructive/30 bg-destructive/15 text-destructive"
                : "border border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {cms.announcement.type === "warning" ? (
              <AlertCircle className="size-3.5 shrink-0" />
            ) : cms.announcement.type === "info" ? (
              <Info className="size-3.5 shrink-0" />
            ) : (
              <Sparkles className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{cms.announcement.text}</span>
          </div>
          {cms.announcement.link && (
            <Link
              to={cms.announcement.link}
              className="shrink-0 text-[11px] underline hover:opacity-80"
            >
              View &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Minimalist Top Bar (No text logo on home header per H1) */}
      <header className="mt-2.5 flex items-center justify-between py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {settings.storeName}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              settings.storeOpen
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {settings.storeOpen ? "Open Now" : "Closed"}
          </span>
        </div>
        <Link
          to="/orders"
          aria-label="My orders"
          className="rounded-lg border border-border p-1.5 text-foreground hover:bg-secondary/40 transition"
        >
          <ShoppingBasket className="size-4" />
        </Link>
      </header>

      {/* Pickup / Delivery Toggle (H3: below hero banner / above category bar) */}
      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs">
        <div className="flex rounded-lg bg-secondary p-0.5">
          {(["pickup", "delivery"] as const).map((t) => (
            <button
              key={t}
              onClick={() => actions.setOrderType(t)}
              disabled={t === "delivery" ? !settings.deliveryOn : !settings.pickupOn}
              className={`rounded-md px-3.5 py-1 text-[11px] font-bold capitalize transition disabled:opacity-40 ${
                orderType === t ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {orderType === "delivery" ? "Delivery Order" : "Pickup (Takeaway)"}
        </span>
      </div>

      {/* Category Bar + Search Icon on Right (H4, H5) */}
      <div className="sticky top-0 z-30 mt-3 bg-background/95 backdrop-blur py-1.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => scrollToSection("must-try")}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "must-try"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Must Try!
            </button>
            {categoryOrder.map((cat) => {
              const label = categoryNames[cat] || cat;
              return (
                <button
                  key={cat}
                  onClick={() => scrollToSection(cat)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    activeTab === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search menu"
            className="shrink-0 rounded-xl border border-border bg-secondary/40 p-2 text-foreground hover:bg-secondary transition"
          >
            <Search className="size-4" />
          </button>
        </div>

        {searchOpen && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu items..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        )}
      </div>

      {/* Katalog: Must Try! Section (M1, M2) */}
      <section
        id="section-must-try"
        data-section-id="must-try"
        className="scrollspy-section mt-4 pt-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Must Try!</h2>
          <span className="text-[11px] text-muted-foreground">Chef recommended</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {displayMustTry.map((m) => (
            <div
              key={m.id}
              className="glow-card overflow-hidden rounded-xl bg-card border border-border/60"
            >
              <button onClick={() => setActive(m)} className="block w-full text-left">
                <div className="p-1.5 pb-0">
                  <img
                    src={resolveMenuImage(m.image)}
                    alt={m.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e)}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                </div>
                <div className="px-2.5 pt-1.5">
                  <p className="line-clamp-1 text-xs font-bold text-foreground">{m.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-primary">{rupiah(m.price)}</p>
                </div>
              </button>
              <div className="flex justify-end px-2.5 pb-2.5 pt-1">
                <button
                  aria-label={`Add ${m.name} to cart`}
                  onClick={() => setActive(m)}
                  className="rounded-md bg-primary p-1 text-primary-foreground transition hover:brightness-105 active:scale-95"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Infinite List per Category (M3) */}
      <div className="mt-6 space-y-6">
        {categoryOrder.map((cat) => {
          const catLabel = categoryNames[cat] || cat;
          const catItems = menu.filter(
            (m) =>
              m.category?.toLowerCase() === cat.toLowerCase() &&
              (q ? m.name.toLowerCase().includes(q.toLowerCase()) : true),
          );

          if (catItems.length === 0) return null;

          return (
            <section
              key={cat}
              id={`section-${cat}`}
              data-section-id={cat}
              className="scrollspy-section pt-2"
            >
              <h2 className="text-sm font-bold text-foreground pb-2 border-b border-border/60">
                {catLabel}
              </h2>
              <div className="mt-2.5 space-y-2">
                {catItems.map((m) => (
                  <div
                    key={m.id}
                    className="glow-card flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2.5"
                  >
                    <button
                      onClick={() => setActive(m)}
                      className="shrink-0 text-left"
                      aria-label={m.name}
                    >
                      <img
                        src={resolveMenuImage(m.image)}
                        alt={m.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e)}
                        className="size-20 rounded-lg object-cover"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => setActive(m)} className="block w-full text-left">
                        <p className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground">
                          {m.name}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-primary">
                          {rupiah(m.price)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                          {m.description}
                        </p>
                        {!m.available && (
                          <p className="mt-0.5 text-[10px] font-bold text-destructive">Sold out</p>
                        )}
                      </button>
                      <div className="mt-1 flex justify-end">
                        <button
                          disabled={!m.available}
                          aria-label={`Add ${m.name}`}
                          onClick={() => setActive(m)}
                          className="rounded-md bg-primary p-1 text-primary-foreground disabled:opacity-30 transition hover:brightness-105 active:scale-95"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {catItems.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No items in {catLabel}.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* FAQ Accordion Section */}
      {activeFaqs.length > 0 && (
        <section className="mt-8 space-y-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-primary" />
            <h3 className="text-xs font-bold text-foreground">Frequently Asked Questions (FAQ)</h3>
          </div>
          <div className="space-y-1.5">
            {activeFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-lg border border-border bg-card transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between p-2.5 text-left text-[11px] font-semibold text-foreground hover:bg-secondary/40"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-border bg-secondary/20 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* About & Socials */}
      {cms.socials?.active && (
        <>
          {cms.aboutStory && (
            <section className="mt-6 rounded-xl border border-border/80 bg-secondary/20 p-3 text-center">
              <p className="font-display text-sm italic text-primary">
                {cms.brandName} {cms.brandSuffix}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {cms.aboutStory}
              </p>
            </section>
          )}

          <a
            href={`https://wa.me/${cms.socials?.whatsapp?.replace(/\D/g, "") || settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold transition hover:bg-secondary/40"
          >
            <MessageCircle className="size-3.5 text-primary" /> Chat with us on WhatsApp
          </a>
        </>
      )}

      <InstallPrompt />
      {active && <ProductSheet item={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}
