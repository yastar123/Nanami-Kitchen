import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  ExternalLink,
  Eye,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutTemplate,
  MessageSquare,
  Palette,
  Plus,
  RefreshCw,
  Share2,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UtensilsCrossed,
  Volume2,
  X,
  Pencil,
  CreditCard,
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const promoInputRef = useRef<HTMLInputElement>(null);
  const welcomeInputRef = useRef<HTMLInputElement>(null);

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

      {/* TAB 2: HERO BANNER & SLOGAN */}
      {activeTab === "hero" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <SectionCard
              title="Main Hero Banner Image"
              description="Primary image featured at the top of home screen and welcome splash."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Hero Banner Status</p>
                    <p className="text-xs text-muted-foreground">
                      Show hero section on home screen.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      actionsShadow.updateCms({ heroActive: !cms.heroActive });
                      triggerToast();
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      cms.heroActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cms.heroActive ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Pilihan Gambar Bawaan (Presets)
                    </label>
                    {cms.heroImage && (
                      <button
                        type="button"
                        onClick={() => {
                          actionsShadow.updateCms({ heroImage: "" });
                          triggerToast();
                        }}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="size-3.5" /> Hapus / Reset Banner
                      </button>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {HERO_PRESETS.map((p) => {
                      const isSelected = (cms.heroImage || heroImg) === p.url;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            actionsShadow.updateCms({ heroImage: p.url });
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
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Upload Foto Banner
                    </label>
                    <input
                      type="file"
                      ref={heroInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (base64) =>
                          actionsShadow.updateCms({ heroImage: base64 }),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                    >
                      <Upload className="size-4" /> Upload Dari Perangkat
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Media Gallery</label>
                    <button
                      type="button"
                      onClick={() => setShowHeroGallery(true)}
                      className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                    >
                      <ImageIcon className="size-4" /> Pilih dari Galeri
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Atau URL Gambar</label>
                    <input
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={cms.heroImage}
                      onChange={(e) => {
                        actionsShadow.updateCms({ heroImage: e.target.value });
                        triggerToast();
                      }}
                      className={fieldClass}
                    />
                  </div>
                </div>

                {cms.heroImage && (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cms.heroImage}
                        alt="Active hero banner"
                        className="size-10 rounded-lg object-cover border"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">Banner Kustom Aktif</p>
                        <p className="text-[10px] text-muted-foreground">
                          Banner ini ditampilkan di bagian atas beranda pelanggan.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        actionsShadow.updateCms({ heroImage: "" });
                        triggerToast();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
                    >
                      <Trash2 className="size-3.5" /> Hapus Banner
                    </button>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Headline & Call To Action (CTA)"
              description="Primary message greeting customers on home screen."
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
                  CTA Button Text
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

          {/* Hero Live Preview */}
          <div className="space-y-4 lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Eye className="size-4 text-primary" /> Live Preview Hero Card
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Customer View
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <div className="relative h-48 w-full">
                  <img
                    src={cms.heroImage || heroImg}
                    alt="Hero banner preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
                  <div className="absolute inset-y-0 left-0 flex w-3/4 flex-col justify-center p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      SPECIAL RECOMMENDATION
                    </span>
                    <h3 className="text-xl font-extrabold leading-tight text-primary">
                      {cms.heroTitleLine1}
                      <br />
                      {cms.heroTitleLine2}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{cms.tagline}</p>
                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm">
                        {cms.heroCtaText || "Order Now"} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showHeroGallery && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-bold">Media Library</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Pilih Foto Hero Banner
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
              title="Welcome Splash Screen Config"
              description="Opening splash animation when customers first launch the app."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Enable Welcome Screen</p>
                    <p className="text-xs text-muted-foreground">
                      Show animated splash screen logo on session startup.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      actionsShadow.updateCmsWelcome({ enabled: !cms.welcomeScreen.enabled });
                      triggerToast();
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      cms.welcomeScreen.enabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cms.welcomeScreen.enabled ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs text-muted-foreground">
                    Splash Title
                    <input
                      value={cms.welcomeScreen.title}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({ title: e.target.value });
                        triggerToast();
                      }}
                      placeholder="nanami"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    Splash Subtitle
                    <input
                      value={cms.welcomeScreen.subtitle}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({ subtitle: e.target.value });
                        triggerToast();
                      }}
                      placeholder="kitchen"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground">
                    Splash Slogan Text
                    <textarea
                      rows={2}
                      value={cms.welcomeScreen.slogan}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({ slogan: e.target.value });
                        triggerToast();
                      }}
                      placeholder="Good Food.&#10;Made with Love"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground">
                    Auto Duration (Seconds)
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="6"
                      value={cms.welcomeScreen.durationSec}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({
                          durationSec: parseFloat(e.target.value) || 2.6,
                        });
                        triggerToast();
                      }}
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Gambar Pembuka / Splash Image (Terpisah dari Hero Banner)
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
                        <Trash2 className="size-3.5" /> Hapus / Reset Gambar
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Gambar Welcome Screen ini berdiri sendiri dan tidak terikat dengan Hero Banner /
                    Slider Banner.
                  </p>
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
                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => welcomeInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                    >
                      <Upload className="size-4" /> Upload Dari Perangkat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWelcomeGallery(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                    >
                      <ImageIcon className="size-4" /> Pilih dari Galeri
                    </button>
                    <input
                      type="url"
                      placeholder="Atau URL gambar (https://...)"
                      value={cms.welcomeScreen.imageUrl || ""}
                      onChange={(e) => {
                        actionsShadow.updateCmsWelcome({ imageUrl: e.target.value });
                        triggerToast();
                      }}
                      className={fieldClass}
                    />
                  </div>

                  {cms.welcomeScreen.imageUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={cms.welcomeScreen.imageUrl}
                          alt="Splash preview"
                          className="size-10 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="text-xs font-bold">Gambar Splash Kustom</p>
                          <p className="text-[10px] text-muted-foreground">
                            Aktif ditampilkan saat splash pembuka.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          actionsShadow.updateCmsWelcome({ imageUrl: "" });
                          triggerToast();
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        title="Hapus gambar"
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
                      Pilih Gambar Welcome Screen
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

          {/* Welcome Screen Mockup */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Eye className="size-4 text-primary" /> Preview Welcome Splash
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cms.welcomeScreen.durationSec} Seconds
                </span>
              </div>

              {/* Realistic Splash Preview Box */}
              <div className="mt-4 flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-[oklch(0.16_0.01_60)] px-6 py-8 text-center text-white shadow-md">
                <div className="flex flex-col items-center">
                  <img
                    src={cms.logoUrl || defaultLogo}
                    alt="Logo preview"
                    className="size-16 rounded-xl object-contain"
                  />
                  <h3 className="mt-2 font-display text-2xl italic tracking-tight text-[oklch(0.82_0.12_85)]">
                    {cms.welcomeScreen.title || "nanami"}
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.45em] text-[oklch(0.82_0.12_85)]">
                    {cms.welcomeScreen.subtitle || "kitchen"}
                  </p>
                  <p className="mt-4 whitespace-pre-line text-xs text-[oklch(0.92_0.01_80)]">
                    {cms.welcomeScreen.slogan || "Good Food.\nMade with Love"}
                  </p>
                </div>

                <div className="mt-6 w-full overflow-hidden rounded-xl">
                  <img
                    src={cms.welcomeScreen.imageUrl || heroImg}
                    alt="Welcome Splash Dish"
                    className="h-24 w-full object-cover"
                  />
                </div>
              </div>
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
