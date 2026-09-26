import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutTemplate,
  MessageSquare,
  Palette,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Share2,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UtensilsCrossed,
  Volume2,
  X,
} from "lucide-react";
import {
  actions,
  CATEGORIES,
  defaultCmsContent,
  defaultCheckoutCms,
  rupiah,
  uid,
  useStore,
  type CmsFaq,
  type Promo,
  type CmsContent,
  type CheckoutCms,
  type Settings,
} from "@/lib/store";
import defaultLogo from "@/assets/nanami-logo.png";
import heroImg from "@/assets/hero.jpg";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import { SectionCard, fieldClass } from "./DashboardShell";
import { MediaGallery } from "./MediaGallery";
import { CheckoutCmsSection } from "./CheckoutCmsSection";
import { compressImage } from "@/lib/image-compression";

const LOGO_PRESETS = [
  { id: "default", name: "Default Nanami Logo", url: defaultLogo },
  {
    id: "bento",
    name: "Bento Master Icon",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "sushi",
    name: "Japanese Minimalist",
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "ramen",
    name: "Chef Bowl Badge",
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=150&auto=format&fit=crop&q=80",
  },
];

const HERO_PRESETS = [
  { id: "default", name: "Default Signature Dish", url: heroImg },
  { id: "food1", name: "Bento Teriyaki Spread", url: food1 },
  { id: "food2", name: "Crispy Smashed Chicken Feast", url: food2 },
  { id: "food3", name: "Golden Crispy Snacks", url: food3 },
  { id: "food4", name: "Refreshing Matcha & Boba", url: food4 },
  {
    id: "japanese-dining",
    name: "Izakaya Warm Ambiance",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
  },
];

interface CmsPanelProps {
  cms?: CmsContent;
  promos?: Promo[];
  settings?: Settings;
  onChangeCms?: (cms: CmsContent) => void;
  onChangePromos?: (promos: Promo[]) => void;
  onChangeSettings?: (settings: Settings) => void;
  onResetCms?: () => void;
}

export function CmsPanel(props: CmsPanelProps = {}) {
  const storeData = useStore((s) => ({
    cms: s.cms || defaultCmsContent,
    promos: s.promos,
    settings: s.settings,
    menu: s.menu,
  }));

  const cms = props.cms || storeData.cms;
  const promos = props.promos || storeData.promos;
  const settings = props.settings || storeData.settings;
  const menu = storeData.menu;

  const actionsShadow = {
    updateCms(patch: Partial<CmsContent>) {
      const updated = { ...cms, ...patch };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCms(patch);
      }
    },
    updateCmsAnnouncement(patch: Partial<CmsContent["announcement"]>) {
      const updated = {
        ...cms,
        announcement: { ...cms.announcement, ...patch },
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCmsAnnouncement(patch);
      }
    },
    updateCmsWelcome(patch: Partial<CmsContent["welcomeScreen"]>) {
      const updated = {
        ...cms,
        welcomeScreen: { ...cms.welcomeScreen, ...patch },
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCmsWelcome(patch);
      }
    },
    updateCmsSocials(patch: Partial<CmsContent["socials"]>) {
      const updated = {
        ...cms,
        socials: { ...cms.socials, ...patch },
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCmsSocials(patch);
      }
    },
    updateCmsCheckout(patch: Partial<CheckoutCms>) {
      const current = cms.checkout || defaultCheckoutCms;
      const updatedCheckout = { ...current, ...patch };
      const updated = {
        ...cms,
        checkout: updatedCheckout,
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCmsCheckout(patch);
      }
    },
    updateCmsFaq(id: string, patch: Partial<CmsFaq>) {
      const updated = {
        ...cms,
        faqs: cms.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.updateCmsFaq(id, patch);
      }
    },
    addCmsFaq(faq: Omit<CmsFaq, "id"> | CmsFaq) {
      const fullFaq: CmsFaq = "id" in faq ? faq : { ...faq, id: uid() };
      const updated = {
        ...cms,
        faqs: [...cms.faqs, fullFaq],
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.addCmsFaq(fullFaq);
      }
    },
    deleteCmsFaq(id: string) {
      const updated = {
        ...cms,
        faqs: cms.faqs.filter((f) => f.id !== id),
      };
      if (props.onChangeCms) {
        props.onChangeCms(updated);
      } else {
        actions.deleteCmsFaq(id);
      }
    },
    savePromo(p: Promo) {
      const updated = promos.some((x) => x.id === p.id)
        ? promos.map((x) => (x.id === p.id ? p : x))
        : [...promos, p];
      if (props.onChangePromos) {
        props.onChangePromos(updated);
      } else {
        actions.savePromo(p);
      }
    },
    deletePromo(id: string) {
      const updated = promos.filter((p) => p.id !== id);
      if (props.onChangePromos) {
        props.onChangePromos(updated);
      } else {
        actions.deletePromo(id);
      }
    },
    updateSettings(patch: Partial<Settings>) {
      const updated = { ...settings, ...patch };
      if (props.onChangeSettings) {
        props.onChangeSettings(updated);
      } else {
        actions.updateSettings(patch);
      }
    },
    resetCms() {
      if (props.onResetCms) {
        props.onResetCms();
      } else {
        actions.resetCms();
      }
    },
  };

  const actions = actionsShadow;

  const [activeTab, setActiveTab] = useState<
    | "branding"
    | "hero"
    | "announcement"
    | "promos"
    | "welcome"
    | "socials"
    | "faqs"
    | "catalog"
    | "checkout"
  >("branding");

  const [saveToast, setSaveToast] = useState(false);
  const [showHeroGallery, setShowHeroGallery] = useState(false);
  const [showWelcomeGallery, setShowWelcomeGallery] = useState(false);
  const [activeGallerySlideId, setActiveGallerySlideId] = useState<string | null>(null);

  // Interactive Hero Carousel state
  const [carouselPreviewIdx, setCarouselPreviewIdx] = useState(0);
  const [carouselAutoPlay, setCarouselAutoPlay] = useState(true);
  const [carouselViewMode, setCarouselViewMode] = useState<"app" | "banner">("app");
  const [showAddSlideForm, setShowAddSlideForm] = useState(false);
  const [newSlideForm, setNewSlideForm] = useState({
    title: "",
    subtitle: "",
    badge: "PROMO",
    imageUrl: "",
    link: "",
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const promoInputRef = useRef<HTMLInputElement>(null);
  const welcomeInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadSlideId, setActiveUploadSlideId] = useState<string | null>(null);

  // New Promo form state
  const [promoTitle, setPromoTitle] = useState("");
  const [promoSubtitle, setPromoSubtitle] = useState("");
  const [promoBadge, setPromoBadge] = useState("PROMO");
  const [promoImage, setPromoImage] = useState("");

  // New FAQ form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Carousel slides derived list (promos or default fallback)
  const currentHeroSlides: Promo[] = useMemo(() => {
    if (promos.length > 0) return promos;
    return [
      {
        id: "p-signature",
        title: "Signature Bento Teriyaki",
        subtitle: "Premium grilled chicken teriyaki bento with savory sauce",
        badge: "SIGNATURE",
        imageUrl: cms.heroImage || heroImg,
        link: "/menu",
        active: true,
      },
    ];
  }, [promos, cms.heroImage]);

  // Auto-play timer for Live Carousel Preview
  useEffect(() => {
    if (!carouselAutoPlay) return;
    const activeCount = currentHeroSlides.filter((s) => s.active !== false).length;
    if (activeCount <= 1) return;
    const timer = setInterval(() => {
      setCarouselPreviewIdx((prev) => (prev + 1) % activeCount);
    }, 3500);
    return () => clearInterval(timer);
  }, [carouselAutoPlay, currentHeroSlides]);

  useEffect(() => {
    const activeCount = currentHeroSlides.filter((s) => s.active !== false).length;
    if (carouselPreviewIdx >= activeCount && activeCount > 0) {
      setCarouselPreviewIdx(0);
    }
  }, [currentHeroSlides, carouselPreviewIdx]);

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= promos.length) return;
    const next = [...promos];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(targetIdx, 0, moved);
    if (props.onChangePromos) {
      props.onChangePromos(next);
    } else {
      actionsShadow.savePromo(moved);
    }
    // Sync cms.heroImage with first slide if available
    if (next[0]?.imageUrl) {
      actionsShadow.updateCms({ heroImage: next[0].imageUrl });
    }
    setCarouselPreviewIdx(targetIdx);
    triggerToast();
  };

  const handleUpdateSlide = (id: string, patch: Partial<Promo>) => {
    const targetPromo = promos.find((p) => p.id === id);
    if (!targetPromo) {
      // If editing default fallback slide, initialize promos array
      const initialSlides = currentHeroSlides.map((p) => (p.id === id ? { ...p, ...patch } : p));
      if (props.onChangePromos) {
        props.onChangePromos(initialSlides);
      } else {
        initialSlides.forEach((s) => actionsShadow.savePromo(s));
      }
      triggerToast();
      return;
    }
    const updated = promos.map((p) => (p.id === id ? { ...p, ...patch } : p));
    if (props.onChangePromos) {
      props.onChangePromos(updated);
    } else {
      actionsShadow.savePromo({ ...targetPromo, ...patch });
    }
    if (id === promos[0]?.id && patch.imageUrl) {
      actionsShadow.updateCms({ heroImage: patch.imageUrl });
    }
    triggerToast();
  };

  const handleDeleteSlide = (id: string) => {
    const updated = promos.filter((p) => p.id !== id);
    if (props.onChangePromos) {
      props.onChangePromos(updated);
    } else {
      actionsShadow.deletePromo(id);
    }
    if (carouselPreviewIdx >= updated.length && updated.length > 0) {
      setCarouselPreviewIdx(0);
    }
    triggerToast();
  };

  const handleLoadDefaultCarousel = () => {
    const defaultSlides: Promo[] = [
      {
        id: "p1",
        title: "Bento Teriyaki Signature",
        subtitle: "Delicious grilled chicken teriyaki with authentic sauce",
        badge: "SIGNATURE",
        imageUrl: heroImg,
        link: "/menu",
        active: true,
      },
      {
        id: "p2",
        title: "Crispy Smashed Chicken 20% OFF",
        subtitle: "Crispy savory fiery smashed chicken — code: NANAMI20",
        badge: "HOT PROMO",
        imageUrl: food2,
        link: "/menu",
        active: true,
      },
      {
        id: "p3",
        title: "Crispy Snack Platter",
        subtitle: "Golden crunchy bites perfect for sharing",
        badge: "BEST SELLER",
        imageUrl: food3,
        link: "/menu",
        active: true,
      },
      {
        id: "p4",
        title: "Handcrafted Matcha & Boba",
        subtitle: "Refreshing sweet boba and creamy iced beverage",
        badge: "REFRESHING",
        imageUrl: food4,
        link: "/menu",
        active: true,
      },
    ];
    if (props.onChangePromos) {
      props.onChangePromos(defaultSlides);
    } else {
      defaultSlides.forEach((s) => actionsShadow.savePromo(s));
    }
    actionsShadow.updateCms({ heroImage: heroImg, heroActive: true });
    setCarouselPreviewIdx(0);
    triggerToast();
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      if (compressed) {
        callback(compressed);
        triggerToast();
        return;
      }
    } catch (err) {
      void err;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        callback(reader.result);
        triggerToast();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetCms = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all public content to Nanami Kitchen's original default configuration?",
      )
    ) {
      actions.resetCms();
      triggerToast();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Live Preview link */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Palette className="size-4" />
            </span>
            <h2 className="text-base font-bold text-foreground">Content Management System (CMS)</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage store visual identity, logo, promo banners, announcement text, and public store
            information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/owner/preview"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Smartphone className="size-3.5" />
            Open Live Preview
          </Link>
          <button
            onClick={handleResetCms}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            <RefreshCw className="size-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Save indicator toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-success/30 bg-success/20 px-4 py-3 text-sm font-bold text-success shadow-lg backdrop-blur">
          <Check className="size-4" /> Changes saved successfully!
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-secondary/20 p-1.5">
        {[
          { key: "branding", label: "Logo & Identity", icon: Palette },
          { key: "hero", label: "Hero Banner", icon: LayoutTemplate },
          { key: "announcement", label: "Announcement", icon: Volume2 },
          { key: "promos", label: "Promo Banners", icon: Tag },
          { key: "welcome", label: "Welcome Screen", icon: Sparkles },
          { key: "socials", label: "Contact & Socials", icon: Share2 },
          { key: "faqs", label: "FAQ & Help", icon: HelpCircle },
          { key: "catalog", label: "Catalog & Must Try", icon: UtensilsCrossed },
          { key: "checkout", label: "Checkout Page", icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: BRANDING & LOGO */}
      {activeTab === "branding" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <SectionCard
              title="Main App Logo"
              description="Logo displayed on customer app header, staff panel, and order invoices."
            >
              <div className="space-y-4">
                {/* Logo Preset Picker */}
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Select From Presets
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LOGO_PRESETS.map((p) => {
                      const isSelected = (cms.logoUrl || defaultLogo) === p.url;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            actionsShadow.updateCms({
                              logoUrl: p.url === defaultLogo ? "" : p.url,
                            });
                            triggerToast();
                          }}
                          className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 text-center transition ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border bg-card hover:bg-secondary/40"
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.name}
                            className="size-10 rounded-lg object-contain"
                          />
                          <span className="text-[11px] font-medium leading-tight">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Image Upload & URL */}
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Upload From Computer / Phone
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (base64) =>
                          actionsShadow.updateCms({ logoUrl: base64 }),
                        )
                      }
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                    >
                      <Upload className="size-4" /> Upload Image File
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Or Image URL Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={cms.logoUrl}
                      onChange={(e) => {
                        actionsShadow.updateCms({ logoUrl: e.target.value });
                        triggerToast();
                      }}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Brand Name & Typography"
              description="Format of restaurant title text in app header."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs text-muted-foreground">
                  Primary Name (Display Style)
                  <input
                    value={cms.brandName}
                    onChange={(e) => {
                      actionsShadow.updateCms({ brandName: e.target.value });
                      triggerToast();
                    }}
                    placeholder="nanami"
                    className={fieldClass}
                  />
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    Example: &quot;nanami&quot; (Bold italic display serif font)
                  </span>
                </label>

                <label className="block text-xs text-muted-foreground">
                  Sub-name / Suffix
                  <input
                    value={cms.brandSuffix}
                    onChange={(e) => {
                      actionsShadow.updateCms({ brandSuffix: e.target.value });
                      triggerToast();
                    }}
                    placeholder="kitchen"
                    className={fieldClass}
                  />
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    Example: &quot;kitchen&quot; (Tracked uppercase text)
                  </span>
                </label>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-muted-foreground">
                  Short Tagline
                  <input
                    value={cms.tagline}
                    onChange={(e) => {
                      actionsShadow.updateCms({ tagline: e.target.value });
                      actionsShadow.updateSettings({ storeTagline: e.target.value });
                      triggerToast();
                    }}
                    placeholder="Good food, made with love."
                    className={fieldClass}
                  />
                </label>
              </div>
            </SectionCard>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4 lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Eye className="size-4 text-primary" />
                  Customer Header Live Preview
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Instant Sync
                </span>
              </div>

              {/* Mockup Header */}
              <div className="mt-4 rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={cms.logoUrl || defaultLogo}
                      alt="Brand Logo"
                      className="size-11 rounded-lg object-contain"
                    />
                    <div className="leading-none">
                      <h1 className="font-display text-3xl italic text-primary">
                        {cms.brandName || "nanami"}
                      </h1>
                      <p className="mt-1 text-xs uppercase tracking-[0.45em] text-primary/80">
                        {cms.brandSuffix || "kitchen"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-2 text-foreground">
                    <Tag className="size-4" />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                Active Tagline: <strong className="text-foreground">{cms.tagline}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO BANNER & CAROUSEL SLIDES */}
      {activeTab === "hero" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Carousel Slide Sequence & Controls */}
          <div className="space-y-6 lg:col-span-7">
            {/* Carousel Master Settings Card */}
            <SectionCard
              title="Hero Banner & Carousel Slides"
              description="Manage the order and content of hero carousel slides shown at the top of the storefront."
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                        {currentHeroSlides.filter((s) => s.active !== false).length}
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        Storefront Banner Carousel Status
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cms.heroActive !== false
                        ? "Carousel is active and auto-rotates at the top of the customer app."
                        : "Hero carousel is currently hidden from the customer storefront."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        actionsShadow.updateCms({ heroActive: !cms.heroActive });
                        triggerToast();
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        cms.heroActive !== false
                          ? "bg-primary text-primary-foreground shadow-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cms.heroActive !== false ? "CAROUSEL ACTIVE" : "INACTIVE"}
                    </button>
                  </div>
                </div>

                {/* Fast Action Buttons: Add Slide & Load Default Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 pt-1">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    Carousel Slide Order ({promos.length || 1} Slides)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSlideForm((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                      <Plus className="size-3.5" />
                      {showAddSlideForm ? "Close Form" : "Add New Slide"}
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadDefaultCarousel}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      <RefreshCw className="size-3" />
                      Load 4 Default Presets
                    </button>
                  </div>
                </div>

                {/* Add New Slide Form Card (Collapsible) */}
                {showAddSlideForm && (
                  <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="size-3.5" />
                        Add New Carousel Slide
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddSlideForm(false)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs text-muted-foreground">
                        Banner Title
                        <input
                          value={newSlideForm.title}
                          onChange={(e) =>
                            setNewSlideForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. Weekend Bento Special 20% OFF"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Badge / Tag
                        <input
                          value={newSlideForm.badge}
                          onChange={(e) =>
                            setNewSlideForm((prev) => ({ ...prev, badge: e.target.value }))
                          }
                          placeholder="e.g. SPECIAL / 20% OFF / NEW"
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs text-muted-foreground">
                        Subtitle / Caption
                        <input
                          value={newSlideForm.subtitle}
                          onChange={(e) =>
                            setNewSlideForm((prev) => ({ ...prev, subtitle: e.target.value }))
                          }
                          placeholder="e.g. Use voucher code NANAMI20"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Target Link (Optional)
                        <input
                          value={newSlideForm.link}
                          onChange={(e) =>
                            setNewSlideForm((prev) => ({ ...prev, link: e.target.value }))
                          }
                          placeholder="/menu or /vouchers"
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    {/* Quick Image Pick for New Slide */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Select Slide Banner Image:
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {HERO_PRESETS.map((p) => {
                          const isSel = (newSlideForm.imageUrl || heroImg) === p.url;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                setNewSlideForm((prev) => ({ ...prev, imageUrl: p.url }))
                              }
                              className={`group relative overflow-hidden rounded-xl border text-left transition ${
                                isSel
                                  ? "border-primary ring-2 ring-primary/40"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <img
                                src={p.url}
                                alt={p.name}
                                className="h-12 w-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="bg-background/90 p-1 truncate text-[9px] font-medium">
                                {p.name.split(" ")[0]}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 flex gap-2">
                        <input
                          value={newSlideForm.imageUrl}
                          onChange={(e) =>
                            setNewSlideForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                          }
                          placeholder="Or enter image URL (https://...)"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSlideForm(false)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newSlide: Promo = {
                            id: uid(),
                            title: newSlideForm.title.trim() || "Nanami Special Promo",
                            subtitle:
                              newSlideForm.subtitle.trim() ||
                              "Enjoy signature bentos & savory dishes",
                            badge: newSlideForm.badge.trim() || "PROMO",
                            imageUrl: newSlideForm.imageUrl.trim() || heroImg,
                            link: newSlideForm.link.trim() || "/menu",
                            active: true,
                          };
                          const nextSlides = [...promos, newSlide];
                          if (props.onChangePromos) {
                            props.onChangePromos(nextSlides);
                          } else {
                            actionsShadow.savePromo(newSlide);
                          }
                          setNewSlideForm({
                            title: "",
                            subtitle: "",
                            badge: "PROMO",
                            imageUrl: "",
                            link: "",
                          });
                          setShowAddSlideForm(false);
                          setCarouselPreviewIdx(nextSlides.length - 1);
                          triggerToast();
                        }}
                        className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                      >
                        Save New Slide
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden File Input for slide photo uploads */}
                <input
                  type="file"
                  ref={slideFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (activeUploadSlideId) {
                      handleFileUpload(e, (base64) => {
                        handleUpdateSlide(activeUploadSlideId, { imageUrl: base64 });
                      });
                    }
                  }}
                />

                {/* Carousel Slide Cards List (Ordered: Slide #1, Slide #2, Slide #3, ...) */}
                <div className="space-y-4">
                  {currentHeroSlides.map((slide, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === currentHeroSlides.length - 1;
                    const isSlideActive = slide.active !== false;
                    const slideImg = slide.imageUrl || (idx === 0 ? heroImg : food2);

                    return (
                      <div
                        key={slide.id}
                        className={`overflow-hidden rounded-2xl border transition shadow-xs ${
                          isSlideActive
                            ? "border-border bg-card"
                            : "border-border/50 bg-secondary/15 opacity-70"
                        }`}
                      >
                        {/* Slide Card Header with Order Numbering & Reorder Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/25 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                isFirst
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-secondary text-foreground border border-border"
                              }`}
                            >
                              {isFirst ? "🌟 Slide #1 (Primary Banner)" : `Slide #${idx + 1}`}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                isSlideActive
                                  ? "bg-success/15 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isSlideActive ? "ACTIVE" : "HIDDEN"}
                            </span>
                          </div>

                          {/* Reorder and Action Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveSlide(idx, "up")}
                              title="Move up"
                              className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-30 transition"
                            >
                              <ArrowUp className="size-3.5" />
                              <span className="hidden sm:inline text-[11px]">Up</span>
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveSlide(idx, "down")}
                              title="Move down"
                              className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-30 transition"
                            >
                              <ArrowDown className="size-3.5" />
                              <span className="hidden sm:inline text-[11px]">Down</span>
                            </button>

                            {/* Toggle Active Switch */}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSlide(slide.id, { active: !isSlideActive })
                              }
                              className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                                isSlideActive
                                  ? "text-primary hover:bg-primary/10"
                                  : "text-muted-foreground hover:bg-secondary"
                              }`}
                            >
                              {isSlideActive ? "Hide" : "Show"}
                            </button>

                            {/* Delete Slide */}
                            {currentHeroSlides.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(slide.id)}
                                title="Delete slide from carousel"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Slide Card Body */}
                        <div className="p-4 space-y-4">
                          {/* Image Selector & Preview */}
                          <div className="grid gap-4 sm:grid-cols-12">
                            {/* Slide Thumbnail */}
                            <div className="sm:col-span-4 space-y-2">
                              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                                Slide Banner Photo
                              </label>
                              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary/30 shadow-xs">
                                <img
                                  src={slideImg}
                                  alt={slide.title || `Slide ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute top-1.5 left-1.5">
                                  <span className="rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white">
                                    {slide.badge || "PROMO"}
                                  </span>
                                </div>
                              </div>

                              {/* Upload & Gallery Action Buttons */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveUploadSlideId(slide.id);
                                    slideFileInputRef.current?.click();
                                  }}
                                  className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/30 px-2 py-2 text-[11px] font-bold text-foreground hover:border-primary transition"
                                >
                                  <Upload className="size-3" /> Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveGallerySlideId(slide.id)}
                                  className="flex items-center justify-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2 py-2 text-[11px] font-bold text-primary hover:bg-primary/20 transition"
                                >
                                  <ImageIcon className="size-3" /> Gallery
                                </button>
                              </div>
                            </div>

                            {/* Preset Buttons & Text Configuration */}
                            <div className="sm:col-span-8 space-y-3">
                              {/* Quick Preset Selector for this slide */}
                              <div>
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                  Quick Preset Images:
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                                  {HERO_PRESETS.map((p) => {
                                    const isSelected = slideImg === p.url;
                                    return (
                                      <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSlide(slide.id, {
                                            imageUrl: p.url,
                                            title: slide.title || p.name,
                                            badge: slide.badge || p.badge,
                                            subtitle: slide.subtitle || p.subtitle,
                                          });
                                          setCarouselPreviewIdx(idx);
                                        }}
                                        className={`group relative overflow-hidden rounded-lg border text-left transition ${
                                          isSelected
                                            ? "border-primary ring-2 ring-primary/40"
                                            : "border-border hover:border-muted-foreground"
                                        }`}
                                      >
                                        <img
                                          src={p.url}
                                          alt={p.name}
                                          className="h-9 w-full object-cover group-hover:scale-105 transition"
                                        />
                                        <div className="bg-background/90 p-0.5 truncate text-[8px] font-medium leading-none">
                                          {p.name.split(" ")[0]}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Image URL Input */}
                              <div>
                                <label className="text-[11px] text-muted-foreground block mb-0.5">
                                  Or Image URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://example.com/slide-banner.jpg"
                                  value={slide.imageUrl || ""}
                                  onChange={(e) =>
                                    handleUpdateSlide(slide.id, { imageUrl: e.target.value })
                                  }
                                  className={fieldClass}
                                />
                              </div>

                              {/* Title, Subtitle, Badge, Link Inputs */}
                              <div className="grid gap-2 sm:grid-cols-2">
                                <label className="block text-[11px] text-muted-foreground">
                                  Slide Title
                                  <input
                                    value={slide.title || ""}
                                    onChange={(e) =>
                                      handleUpdateSlide(slide.id, { title: e.target.value })
                                    }
                                    placeholder="e.g. 20% OFF All Bento"
                                    className={fieldClass}
                                  />
                                </label>
                                <label className="block text-[11px] text-muted-foreground">
                                  Tag / Badge
                                  <input
                                    value={slide.badge || ""}
                                    onChange={(e) =>
                                      handleUpdateSlide(slide.id, { badge: e.target.value })
                                    }
                                    placeholder="e.g. SPECIAL / 20% OFF"
                                    className={fieldClass}
                                  />
                                </label>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                <label className="block text-[11px] text-muted-foreground">
                                  Subtitle
                                  <input
                                    value={slide.subtitle || ""}
                                    onChange={(e) =>
                                      handleUpdateSlide(slide.id, { subtitle: e.target.value })
                                    }
                                    placeholder="e.g. Use promo code NANAMI20"
                                    className={fieldClass}
                                  />
                                </label>
                                <label className="block text-[11px] text-muted-foreground">
                                  Target Link (When Clicked)
                                  <input
                                    value={slide.link || ""}
                                    onChange={(e) =>
                                      handleUpdateSlide(slide.id, { link: e.target.value })
                                    }
                                    placeholder="/menu or /vouchers"
                                    className={fieldClass}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* Headline Slogan & Store Messaging Card */}
            <SectionCard
              title="Tagline & Headline Text"
              description="Welcome messages and storefront display copy."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs text-muted-foreground">
                  Headline Line 1
                  <input
                    value={cms.heroTitleLine1}
                    onChange={(e) => {
                      actionsShadow.updateCms({ heroTitleLine1: e.target.value });
                      triggerToast();
                    }}
                    placeholder="Good Food."
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs text-muted-foreground">
                  Headline Line 2
                  <input
                    value={cms.heroTitleLine2}
                    onChange={(e) => {
                      actionsShadow.updateCms({ heroTitleLine2: e.target.value });
                      triggerToast();
                    }}
                    placeholder="Made with Love"
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid gap-4 pt-3 sm:grid-cols-2">
                <label className="block text-xs text-muted-foreground">
                  Action Button (CTA)
                  <input
                    value={cms.heroCtaText}
                    onChange={(e) => {
                      actionsShadow.updateCms({ heroCtaText: e.target.value });
                      triggerToast();
                    }}
                    placeholder="Order Now"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs text-muted-foreground">
                  Full Slogan
                  <input
                    value={cms.heroSlogan}
                    onChange={(e) => {
                      actionsShadow.updateCms({ heroSlogan: e.target.value });
                      triggerToast();
                    }}
                    placeholder="Good Food. Made with Love"
                    className={fieldClass}
                  />
                </label>
              </div>
            </SectionCard>
          </div>

          {/* Right Column: Full Interactive Live Carousel Preview */}
          <div className="space-y-4 lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
              {/* Preview Header & Controls */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Eye className="size-4 text-primary" />
                  Live Carousel Preview
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCarouselAutoPlay((v) => !v)}
                    title={carouselAutoPlay ? "Pause auto-rotation" : "Start auto-rotation"}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                      carouselAutoPlay
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {carouselAutoPlay ? (
                      <Pause className="size-2.5" />
                    ) : (
                      <Play className="size-2.5" />
                    )}
                    {carouselAutoPlay ? "Auto-Slide ON" : "Paused"}
                  </button>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    1:1 Sync
                  </span>
                </div>
              </div>

              {/* View Mode Toggle: Customer App Header View vs Focused Banner View */}
              <div className="flex rounded-xl bg-secondary/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCarouselViewMode("app")}
                  className={`flex-1 rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                    carouselViewMode === "app"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📱 Customer Home View
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselViewMode("banner")}
                  className={`flex-1 rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                    carouselViewMode === "banner"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🖼️ Focused Banner View
                </button>
              </div>

              {/* Live Preview Container */}
              {(() => {
                const activeSlides = currentHeroSlides.filter((s) => s.active !== false);
                const displaySlides = activeSlides.length > 0 ? activeSlides : currentHeroSlides;
                const safeIdx = carouselPreviewIdx % displaySlides.length;
                const currentSlide = displaySlides[safeIdx] || displaySlides[0];

                return (
                  <div className="space-y-3">
                    {/* Simulated Mobile Device Window */}
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-md">
                      {carouselViewMode === "app" && (
                        <>
                          {/* Mock Mobile Status & Header */}
                          <div className="border-b border-border/40 bg-card/60 px-3 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-semibold">
                              {settings.storeName || "Nanami Kitchen"}
                            </span>
                            <span className="rounded-full bg-success/20 text-success px-2 py-0.5 text-[9px] font-bold">
                              Open Now
                            </span>
                          </div>
                        </>
                      )}

                      {/* Interactive Carousel Banner Stage */}
                      <div className="group relative h-56 sm:h-64 w-full overflow-hidden bg-muted">
                        {displaySlides.map((slide, i) => {
                          const isShowing = i === safeIdx;
                          const img = slide.imageUrl || (i === 0 ? heroImg : food2);

                          return (
                            <div
                              key={slide.id || i}
                              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                isShowing ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                              }`}
                            >
                              <img
                                src={img}
                                alt={slide.title || `Slide ${i + 1}`}
                                className="h-full w-full object-cover transition-transform duration-700"
                              />

                              {/* Subtle bottom gradient & overlay details */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                              {/* Slide Information Overlay */}
                              <div className="absolute bottom-6 left-3 right-3 text-white pointer-events-none">
                                <span className="inline-block rounded-full bg-primary/90 text-primary-foreground px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider mb-1">
                                  {slide.badge || "SPECIAL PROMO"}
                                </span>
                                <h4 className="text-sm font-extrabold line-clamp-1 leading-tight drop-shadow-xs">
                                  {slide.title || "Signature Bento Special"}
                                </h4>
                                {slide.subtitle && (
                                  <p className="text-[11px] text-white/85 line-clamp-1 drop-shadow-xs mt-0.5">
                                    {slide.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Prev / Next Navigation Arrows */}
                        <button
                          type="button"
                          onClick={() =>
                            setCarouselPreviewIdx((prev) =>
                              prev === 0 ? displaySlides.length - 1 : prev - 1,
                            )
                          }
                          aria-label="Previous slide"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/70 transition"
                        >
                          <ChevronLeft className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCarouselPreviewIdx((prev) => (prev + 1) % displaySlides.length)
                          }
                          aria-label="Next slide"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/70 transition"
                        >
                          <ChevronRight className="size-4" />
                        </button>

                        {/* Top-right Slide Number Pill */}
                        <div className="absolute top-2 right-2 z-20 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                          {safeIdx + 1} / {displaySlides.length}
                        </div>

                        {/* Interactive Clickable Bottom Indicator Dots */}
                        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
                          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-xs">
                            {displaySlides.map((s, i) => (
                              <button
                                key={s.id || i}
                                type="button"
                                onClick={() => setCarouselPreviewIdx(i)}
                                aria-label={`Select slide ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  i === safeIdx
                                    ? "w-5 bg-white"
                                    : "w-1.5 bg-white/50 hover:bg-white/80"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {carouselViewMode === "app" && (
                        <div className="border-t border-border/40 bg-card/40 p-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-foreground">Recommended Menu</span>
                            <span className="text-muted-foreground text-[10px]">Must Try!</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Slide Breakdown Detail Card */}
                    {currentSlide && (
                      <div className="rounded-xl border border-border bg-secondary/20 p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Active Slide Details:
                          </span>
                          <span className="font-bold text-foreground">
                            Slide #{safeIdx + 1} ({currentSlide.badge || "PROMO"})
                          </span>
                        </div>
                        <p className="font-semibold text-foreground line-clamp-1">
                          {currentSlide.title || "(Untitled)"}
                        </p>
                        {currentSlide.subtitle && (
                          <p className="text-muted-foreground text-[11px] line-clamp-1">
                            {currentSlide.subtitle}
                          </p>
                        )}
                        <div className="pt-1 flex flex-wrap gap-1">
                          {displaySlides.map((s, idx) => (
                            <button
                              key={s.id || idx}
                              type="button"
                              onClick={() => setCarouselPreviewIdx(idx)}
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                                idx === safeIdx
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Slide {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                💡 <em>Tip:</em> Use the <strong>Up (↑)</strong> / <strong>Down (↓)</strong> buttons
                on the left slide cards to immediately reorder banners in the storefront carousel.
              </p>
            </div>
          </div>

          {/* Media Gallery Picker Modal for specific slide */}
          {activeGallerySlideId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-bold">Media Library</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Select Photo for Carousel Slide
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveGallerySlideId(null)}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <MediaGallery
                    onSelect={(url) => {
                      if (activeGallerySlideId) {
                        handleUpdateSlide(activeGallerySlideId, { imageUrl: url });
                      }
                      setActiveGallerySlideId(null);
                      triggerToast();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fallback Single Hero Gallery Modal */}
          {showHeroGallery && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-bold">Media Library</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Select Hero Banner Photo
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHeroGallery(false)}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <MediaGallery
                    selectedUrl={cms.heroImage}
                    onSelect={(url) => {
                      actionsShadow.updateCms({ heroImage: url });
                      if (promos[0]) {
                        handleUpdateSlide(promos[0].id, { imageUrl: url });
                      }
                      setShowHeroGallery(false);
                      triggerToast();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENT BAR */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <SectionCard
            title="Running Announcement Bar"
            description="Banner ribbon at the top of app to highlight promos, special hours, or notice."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Announcement Bar Status</p>
                  <p className="text-xs text-muted-foreground">
                    Display announcement banner on customer home screen top.
                  </p>
                </div>
                <button
                  onClick={() => {
                    actionsShadow.updateCmsAnnouncement({ enabled: !cms.announcement.enabled });
                    triggerToast();
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    cms.announcement.enabled
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cms.announcement.enabled ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground">
                    Announcement Text
                    <input
                      value={cms.announcement.text}
                      onChange={(e) => {
                        actionsShadow.updateCmsAnnouncement({ text: e.target.value });
                        triggerToast();
                      }}
                      placeholder="🎉 Today's Promo: 20% discount with code..."
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground">
                    Display Type
                    <select
                      value={cms.announcement.type}
                      onChange={(e) => {
                        actionsShadow.updateCmsAnnouncement({
                          type: e.target.value as "info" | "promo" | "warning",
                        });
                        triggerToast();
                      }}
                      className={fieldClass}
                    >
                      <option value="promo">Promo (Gold / Primary Accent)</option>
                      <option value="info">Info (Blue / Neutral)</option>
                      <option value="warning">Important / Alert (Orange)</option>
                    </select>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground">
                  Target Link / Page (Optional)
                  <input
                    value={cms.announcement.link || ""}
                    onChange={(e) => {
                      actionsShadow.updateCmsAnnouncement({ link: e.target.value });
                      triggerToast();
                    }}
                    placeholder="/vouchers or /menu"
                    className={fieldClass}
                  />
                </label>
              </div>

              {/* Announcement Bar Live Preview */}
              <div className="pt-3">
                <label className="text-xs font-semibold text-foreground">
                  Announcement Live Preview
                </label>
                {cms.announcement.enabled ? (
                  <div
                    className={`mt-2 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold ${
                      cms.announcement.type === "promo"
                        ? "border border-amber-500/30 bg-amber-500/15 text-amber-900 dark:text-amber-200"
                        : cms.announcement.type === "warning"
                          ? "border border-destructive/30 bg-destructive/15 text-destructive"
                          : "border border-primary/30 bg-primary/10 text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {cms.announcement.type === "warning" ? (
                        <AlertCircle className="size-4 shrink-0" />
                      ) : cms.announcement.type === "info" ? (
                        <Info className="size-4 shrink-0" />
                      ) : (
                        <Sparkles className="size-4 shrink-0" />
                      )}
                      <span>{cms.announcement.text || "No announcement text configured."}</span>
                    </div>
                    {cms.announcement.link && (
                      <span className="text-[11px] underline">View &rarr;</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Announcement bar is currently disabled.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB 4: BANNER PROMO CAROUSEL (CRUD) */}
      {activeTab === "promos" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Add Promo Form */}
            <div className="space-y-4 lg:col-span-5">
              <SectionCard
                title="Add New Promo Banner"
                description="Interactive banner rotating on home screen promo carousel."
              >
                <div className="space-y-3">
                  <label className="block text-xs text-muted-foreground">
                    Promo Tag Badge
                    <input
                      value={promoBadge}
                      onChange={(e) => setPromoBadge(e.target.value)}
                      placeholder="SPECIAL / 20% OFF"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block text-xs text-muted-foreground">
                    Main Promo Title
                    <input
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="20% Off All Bento Items"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block text-xs text-muted-foreground">
                    Subtitle / Description
                    <input
                      value={promoSubtitle}
                      onChange={(e) => setPromoSubtitle(e.target.value)}
                      placeholder="Use promo code NANAMI20 at checkout"
                      className={fieldClass}
                    />
                  </label>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Promo Banner Photo
                    </label>
                    <input
                      type="file"
                      ref={promoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (base64) => setPromoImage(base64))}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => promoInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                      >
                        <Upload className="size-4" /> Upload From Device
                      </button>
                      <input
                        value={promoImage}
                        onChange={(e) => setPromoImage(e.target.value)}
                        placeholder="Or paste URL (https://...)"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <button
                    disabled={!promoTitle}
                    onClick={() => {
                      actionsShadow.savePromo({
                        id: uid(),
                        title: promoTitle.trim(),
                        subtitle: promoSubtitle.trim(),
                        badge: promoBadge.trim() || "PROMO",
                        imageUrl: promoImage.trim() || "",
                        active: true,
                      });
                      setPromoTitle("");
                      setPromoSubtitle("");
                      setPromoBadge("PROMO");
                      setPromoImage("");
                      triggerToast();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-40"
                  >
                    <Plus className="size-4" /> Save Promo Banner
                  </button>
                </div>
              </SectionCard>
            </div>

            {/* List Promo */}
            <div className="space-y-4 lg:col-span-7">
              <SectionCard
                title={`Active Promo Banners (${promos.length})`}
                description="Manage display status and active promo items."
              >
                {promos.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No promo banners. Add your first promo banner using the form on the left.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {promos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3.5 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              {p.badge}
                            </span>
                            <h4 className="truncate text-sm font-bold text-foreground">
                              {p.title}
                            </h4>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {p.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              actionsShadow.savePromo({ ...p, active: !p.active });
                              triggerToast();
                            }}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                              p.active !== false
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {p.active !== false ? "ACTIVE" : "INACTIVE"}
                          </button>
                          <button
                            onClick={() => {
                              setPromoTitle(p.title);
                              setPromoSubtitle(p.subtitle);
                              setPromoBadge(p.badge);
                              setPromoImage(p.imageUrl || "");
                              actionsShadow.deletePromo(p.id);
                              triggerToast();
                            }}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                            title="Edit Promo (Pops back to form)"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              actionsShadow.deletePromo(p.id);
                              triggerToast();
                            }}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete promo ${p.title}`}
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
          </div>
        </div>
      )}

      {/* TAB 5: WELCOME SPLASH SCREEN */}
      {activeTab === "welcome" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <SectionCard
              title="Full-Bleed Welcome / Splash Screen"
              description="Full-screen introductory visual displayed when customers first visit the website or app."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Enable Welcome Splash Screen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Display full-screen splash visual upon initial visitor session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actionsShadow.updateCmsWelcome({ enabled: !cms.welcomeScreen.enabled });
                      triggerToast();
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      cms.welcomeScreen.enabled
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cms.welcomeScreen.enabled ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground">
                    Auto-Display Duration (Seconds)
                    <input
                      type="number"
                      step="0.5"
                      min="0.8"
                      max="5"
                      value={cms.welcomeScreen.durationSec}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({
                          durationSec: parseFloat(e.target.value) || 1.5,
                        });
                        triggerToast();
                      }}
                      className={fieldClass}
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Customers can also tap anywhere on the screen to skip directly to the menu.
                    </span>
                  </label>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Built-in Splash Presets
                    </label>
                    {cms.welcomeScreen.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          actionsShadow.updateCmsWelcome({ imageUrl: "" });
                          triggerToast();
                        }}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="size-3.5" /> Reset Image
                      </button>
                    )}
                  </div>

                  {/* Preset splash images */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {HERO_PRESETS.map((p) => {
                      const isSelected = (cms.welcomeScreen.imageUrl || heroImg) === p.url;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            actionsShadow.updateCmsWelcome({ imageUrl: p.url });
                            triggerToast();
                          }}
                          className={`group relative overflow-hidden rounded-xl border text-left transition ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/40"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.name}
                            className="h-20 w-full object-cover transition group-hover:scale-105"
                          />
                          <div className="bg-background/90 p-1.5 flex items-center justify-between">
                            <p className="truncate text-[11px] font-medium">{p.name}</p>
                            {isSelected && <Check className="size-3 text-primary shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="file"
                    ref={welcomeInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, (base64) =>
                        actionsShadow.updateCmsWelcome({ imageUrl: base64 }),
                      )
                    }
                  />

                  {/* Upload & Gallery Controls */}
                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground">
                        Upload Full HD Image
                      </label>
                      <button
                        type="button"
                        onClick={() => welcomeInputRef.current?.click()}
                        className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                      >
                        <Upload className="size-4" /> Upload From Device
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground">Media Library</label>
                      <button
                        type="button"
                        onClick={() => setShowWelcomeGallery(true)}
                        className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                      >
                        <ImageIcon className="size-4" /> Choose from Gallery
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground">Or Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/splash.jpg"
                        value={cms.welcomeScreen.imageUrl || ""}
                        onChange={(e) => {
                          actionsShadow.updateCmsWelcome({ imageUrl: e.target.value });
                          triggerToast();
                        }}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {cms.welcomeScreen.imageUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cms.welcomeScreen.imageUrl}
                          alt="Splash preview"
                          className="size-12 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Custom Splash Image Active
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Displayed in crisp full-screen resolution across all device screens.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          actionsShadow.updateCmsWelcome({ imageUrl: "" });
                          triggerToast();
                        }}
                        className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        title="Remove image"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {showWelcomeGallery && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-bold">Media Library</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Select Welcome Screen Image
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWelcomeGallery(false)}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <MediaGallery
                    selectedUrl={cms.welcomeScreen.imageUrl}
                    onSelect={(url) => {
                      actionsShadow.updateCmsWelcome({ imageUrl: url });
                      setShowWelcomeGallery(false);
                      triggerToast();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Live Preview Mockup */}
          <div className="space-y-4 lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Eye className="size-4 text-primary" /> Live Full Splash Screen Preview
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {cms.welcomeScreen.durationSec}s Duration
                </span>
              </div>

              {/* Realistic Full Viewport Splash Simulation */}
              <div className="relative aspect-[9/16] sm:max-h-[500px] w-full overflow-hidden rounded-2xl bg-black shadow-lg border border-border/80">
                <img
                  src={cms.welcomeScreen.imageUrl || heroImg}
                  alt="Full Welcome Splash Preview"
                  className="h-full w-full object-cover object-center"
                />

                {/* Simulated skip hint */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                    Tap anywhere to continue &rarr;
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ✨ <strong>Responsive & Crisp:</strong> The splash visual automatically fills the
                entire screen (full-bleed) on smartphones, tablets, and desktop displays without
                stretching or breaking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONTACT & SOCIALS */}
      {activeTab === "socials" && (
        <div className="space-y-6">
          <SectionCard
            title="Social Links & Public Contact"
            description="WhatsApp hotline, Instagram, TikTok, and Google Maps links shown to customers."
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Socials Section Status</p>
                  <p className="text-xs text-muted-foreground">
                    Show socials links at bottom of app.
                  </p>
                </div>
                <button
                  onClick={() => {
                    actionsShadow.updateCmsSocials({ active: !cms.socials.active });
                    triggerToast();
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    cms.socials.active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cms.socials.active ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs text-muted-foreground">
                  Instagram Handle / URL
                  <input
                    value={cms.socials.instagram}
                    onChange={(e) => {
                      actionsShadow.updateCmsSocials({ instagram: e.target.value });
                      triggerToast();
                    }}
                    placeholder="@nanami.kitchen"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs text-muted-foreground">
                  TikTok Handle / URL
                  <input
                    value={cms.socials.tiktok}
                    onChange={(e) => {
                      actionsShadow.updateCmsSocials({ tiktok: e.target.value });
                      triggerToast();
                    }}
                    placeholder="@nanami.kitchen"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs text-muted-foreground">
                  Store WhatsApp Hotline
                  <input
                    value={cms.socials.whatsapp}
                    onChange={(e) => {
                      actionsShadow.updateCmsSocials({ whatsapp: e.target.value });
                      actionsShadow.updateSettings({ whatsapp: e.target.value });
                      triggerToast();
                    }}
                    placeholder="+27 82 123 4567"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs text-muted-foreground">
                  Google Maps Location Link
                  <input
                    value={cms.socials.mapsUrl}
                    onChange={(e) => {
                      actionsShadow.updateCmsSocials({ mapsUrl: e.target.value });
                      triggerToast();
                    }}
                    placeholder="https://maps.google.com/?q=..."
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-muted-foreground">
                About Restaurant Story / Bio
                <textarea
                  rows={3}
                  value={cms.aboutStory}
                  onChange={(e) => {
                    actionsShadow.updateCms({ aboutStory: e.target.value });
                    triggerToast();
                  }}
                  placeholder="Short story about Nanami Kitchen's origin, authentic Japanese bento recipes, and culinary passion..."
                  className={fieldClass}
                />
              </label>
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB 7: FAQ & HELP (CRUD FAQ) */}
      {activeTab === "faqs" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form Add FAQ */}
          <div className="space-y-4 lg:col-span-5">
            <SectionCard
              title="Add New FAQ"
              description="FAQs appear on customer help page and checkout info."
            >
              <div className="space-y-3">
                <label className="block text-xs text-muted-foreground">
                  Question
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. What is the minimum spend for free delivery?"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs text-muted-foreground">
                  Detailed Answer
                  <textarea
                    rows={3}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write a clear and friendly response..."
                    className={fieldClass}
                  />
                </label>

                <button
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  onClick={() => {
                    actionsShadow.addCmsFaq({
                      question: newQuestion,
                      answer: newAnswer,
                      active: true,
                    });
                    setNewQuestion("");
                    setNewAnswer("");
                    triggerToast();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-40"
                >
                  <Plus className="size-4" /> Save FAQ
                </button>
              </div>
            </SectionCard>
          </div>

          {/* List FAQ */}
          <div className="space-y-4 lg:col-span-7">
            <SectionCard
              title={`Public FAQ List (${cms.faqs?.length || 0})`}
              description="Common questions viewable by customers."
            >
              {!cms.faqs || cms.faqs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No FAQs added yet.</p>
              ) : (
                <div className="space-y-3">
                  {cms.faqs.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">{f.question}</h4>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {f.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              actionsShadow.updateCmsFaq(f.id, { active: !f.active });
                              triggerToast();
                            }}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                              f.active
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {f.active ? "ACTIVE" : "INACTIVE"}
                          </button>
                          <button
                            onClick={() => {
                              setNewQuestion(f.question);
                              setNewAnswer(f.answer);
                              actionsShadow.deleteCmsFaq(f.id);
                              triggerToast();
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                            title="Edit FAQ"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              actionsShadow.deleteCmsFaq(f.id);
                              triggerToast();
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete FAQ ${f.question}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* TAB: CATALOG & MUST TRY */}
      {activeTab === "catalog" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <SectionCard
              title="Must Try! Section Items"
              description="Select which menu items appear in the Must Try! grid at the top of the customer catalog."
            >
              <div className="space-y-2">
                {menu.map((m) => {
                  const isMustTry = (cms.mustTryItemIds || []).includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 cursor-pointer hover:bg-secondary/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.image}
                          alt={m.name}
                          className="size-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.category} • {rupiah(m.price)}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isMustTry}
                        onChange={(e) => {
                          const current = cms.mustTryItemIds || ["m1", "m2", "m3", "m4"];
                          const updated = e.target.checked
                            ? [...current, m.id]
                            : current.filter((id) => id !== m.id);
                          actionsShadow.updateCms({ mustTryItemIds: updated });
                          triggerToast();
                        }}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <SectionCard
              title="Category Order & Renaming"
              description="Customize category display order and rename category labels for the customer app."
            >
              <div className="space-y-3">
                {(cms.categoryOrder || CATEGORIES).map((cat, idx, arr) => {
                  const currentName = (cms.categoryNames || {})[cat] || cat;
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Position {idx + 1} ({cat})
                        </label>
                        <input
                          type="text"
                          value={currentName}
                          onChange={(e) => {
                            const newNames = {
                              ...(cms.categoryNames || {}),
                              [cat]: e.target.value,
                            };
                            actionsShadow.updateCms({ categoryNames: newNames });
                          }}
                          onBlur={() => triggerToast()}
                          className={fieldClass}
                          placeholder="Display Name"
                        />
                      </div>
                      <div className="flex flex-col gap-1 pt-4">
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            const copy = [...arr];
                            const curr = copy[idx];
                            const prev = copy[idx - 1];
                            if (curr && prev) {
                              copy[idx] = prev;
                              copy[idx - 1] = curr;
                              actionsShadow.updateCms({ categoryOrder: copy });
                              triggerToast();
                            }
                          }}
                          className="rounded p-1 bg-secondary text-xs disabled:opacity-30 hover:bg-secondary/80"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            const copy = [...arr];
                            const curr = copy[idx];
                            const next = copy[idx + 1];
                            if (curr && next) {
                              copy[idx] = next;
                              copy[idx + 1] = curr;
                              actionsShadow.updateCms({ categoryOrder: copy });
                              triggerToast();
                            }
                          }}
                          className="rounded p-1 bg-secondary text-xs disabled:opacity-30 hover:bg-secondary/80"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* TAB: CHECKOUT PAGE CMS & CRUD */}
      {activeTab === "checkout" && (
        <CheckoutCmsSection
          checkout={cms.checkout || defaultCheckoutCms}
          onChange={(patch) => {
            actionsShadow.updateCmsCheckout(patch);
            triggerToast();
          }}
          onSaveToast={triggerToast}
          settings={settings}
          onUpdateSettings={(patch) => {
            actionsShadow.updateSettings(patch);
          }}
        />
      )}
    </div>
  );
}
