import { useState, useRef } from "react";
import {
  ImagePlus,
  Layers,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  ImageIcon,
  FolderCog,
  Tag,
} from "lucide-react";
import {
  actions as globalActions,
  rupiah,
  uid,
  useStore,
  CATEGORIES,
  getAvailableCategories,
  resolveMenuImage,
  handleImageError,
  type Category,
  type MenuItem,
  type OptionGroup,
} from "@/lib/store";
import { getCurrencySymbol } from "@/lib/currency";
import { SectionCard, fieldClass } from "./DashboardShell";
import { MediaGallery } from "./MediaGallery";
import { compressImage } from "@/lib/image-compression";
import { CategoryManagerModal } from "./CategoryManagerModal";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import hero from "@/assets/hero.jpg";

const GALLERY = [food1, food2, food3, food4, hero];

type DraftChoice = {
  id: string;
  name: string;
  price: string;
};

type DraftGroup = {
  id: string;
  name: string;
  type: "single" | "multi";
  enabled: boolean;
  choices: DraftChoice[];
};

type Draft = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: Category;
  image: string;
  prepMinutes: string;
  badges: string;
  available: boolean;
  specialRequestEnabled: boolean;
  groups: DraftGroup[];
};

const emptyDraft = (): Draft => ({
  id: "",
  name: "",
  description: "",
  price: "",
  category: "Meals",
  image: GALLERY[0] ?? "",
  prepMinutes: "15",
  badges: "",
  available: true,
  specialRequestEnabled: true,
  groups: [],
});

const toDraft = (m: MenuItem): Draft => ({
  id: m.id,
  name: m.name,
  description: m.description,
  price: String(m.price),
  category: m.category,
  image: m.image,
  prepMinutes: String(m.prepMinutes),
  badges: (m.badges || []).join(", "),
  available: m.available,
  specialRequestEnabled: m.specialRequestEnabled !== false,
  groups: (m.groups || []).map((g) => ({
    id: g.id || uid(),
    name: g.name || "Customization",
    type: g.type === "multi" ? "multi" : "single",
    enabled: g.enabled !== false,
    choices: (g.choices || []).map((c) => ({
      id: c.id || uid(),
      name: c.name || "",
      price: String(c.price ?? 0),
    })),
  })),
});

interface MenuCrudPanelProps {
  menu?: MenuItem[];
  onSaveMenuItem?: (item: MenuItem) => void;
  onDeleteMenuItem?: (id: string) => void;
}

export function MenuCrudPanel(props: MenuCrudPanelProps = {}) {
  const storeMenu = useStore((s) => s.menu);
  const cms = useStore((s) => s.cms);
  const menu = props.menu || storeMenu;

  const categories = getAvailableCategories(cms, menu);
  const categoryNames = cms?.categoryNames || {};

  const actionsShadow = {
    saveMenuItem(item: MenuItem) {
      if (props.onSaveMenuItem) {
        props.onSaveMenuItem(item);
      } else {
        globalActions.saveMenuItem(item);
      }
    },
    deleteMenuItem(id: string) {
      if (props.onDeleteMenuItem) {
        props.onDeleteMenuItem(id);
      } else {
        globalActions.deleteMenuItem(id);
      }
    },
  };

  const actions = actionsShadow;

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [filter, setFilter] = useState<string>("All");
  const [showGallery, setShowGallery] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [quickAddCatOpen, setQuickAddCatOpen] = useState(false);
  const [quickCatInput, setQuickCatInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      if (compressed) {
        patch({ image: compressed });
        return;
      }
    } catch (err) {
      void err;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      if (compressed) {
        patch({ image: compressed });
        return;
      }
    } catch (err) {
      void err;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const list =
    filter === "All"
      ? menu
      : menu.filter((m) => m.category?.toLowerCase() === filter.toLowerCase());

  // Validation: item name required, price > 0, every group must have a name & choices must not be empty
  const hasInvalidGroup = draft.groups.some(
    (g) => !g.name.trim() || g.choices.some((c) => !c.name.trim()),
  );
  const valid = draft.name.trim().length > 0 && Number(draft.price) > 0 && !hasInvalidGroup;
  const editing = Boolean(draft.id);

  // Group helpers
  const addGroup = () => {
    const newGroup: DraftGroup = {
      id: uid(),
      name: "",
      type: "single",
      enabled: true,
      choices: [{ id: uid(), name: "", price: "0" }],
    };
    patch({ groups: [...draft.groups, newGroup] });
  };

  const updateGroup = (groupId: string, p: Partial<DraftGroup>) => {
    patch({
      groups: draft.groups.map((g) => (g.id === groupId ? { ...g, ...p } : g)),
    });
  };

  const removeGroup = (groupId: string) => {
    patch({
      groups: draft.groups.filter((g) => g.id !== groupId),
    });
  };

  const addChoice = (groupId: string) => {
    patch({
      groups: draft.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          choices: [...g.choices, { id: uid(), name: "", price: "0" }],
        };
      }),
    });
  };

  const updateChoice = (groupId: string, choiceId: string, p: Partial<DraftChoice>) => {
    patch({
      groups: draft.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          choices: g.choices.map((c) => (c.id === choiceId ? { ...c, ...p } : c)),
        };
      }),
    });
  };

  const removeChoice = (groupId: string, choiceId: string) => {
    patch({
      groups: draft.groups.map((g) => {
        if (g.id !== groupId) return g;
        if (g.choices.length <= 1) return g;
        return {
          ...g,
          choices: g.choices.filter((c) => c.id !== choiceId),
        };
      }),
    });
  };

  const save = () => {
    const savedGroups: OptionGroup[] = draft.groups.map((g) => ({
      id: g.id || uid(),
      name: g.name.trim(),
      type: g.type,
      enabled: g.enabled,
      choices: g.choices.map((c) => ({
        id: c.id || uid(),
        name: c.name.trim(),
        price: Math.max(0, Number(c.price) || 0),
      })),
    }));

    actions.saveMenuItem({
      id: draft.id || uid(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      category: draft.category,
      image: draft.image,
      available: draft.available,
      prepMinutes: Number(draft.prepMinutes) || 10,
      badges: draft.badges
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      groups: savedGroups,
      specialRequestEnabled: draft.specialRequestEnabled,
    });
    setDraft(emptyDraft());
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[440px_1fr] xl:items-start">
      <div className="space-y-4">
        <SectionCard
          title={editing ? "Edit Menu Item" : "Add Menu Item"}
          description={
            editing
              ? "Changes will appear immediately in the customer app."
              : "Fill in item details to save to catalog."
          }
        >
          <label className="block text-xs text-muted-foreground">
            Item Name *
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Teriyaki Chicken Bento"
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted-foreground">
              Price ({getCurrencySymbol()}) *
              <input
                value={draft.price}
                onChange={(e) => patch({ price: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                placeholder="95"
                className={fieldClass}
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Prep Time (Mins)
              <input
                value={draft.prepMinutes}
                onChange={(e) => patch({ prepMinutes: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Category *</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAddCatOpen((v) => !v)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <Plus className="size-3" /> {quickAddCatOpen ? "Cancel" : "Quick Add"}
                </button>
                <span className="text-muted-foreground/30">•</span>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  <FolderCog className="size-3 text-primary" /> Manage All
                </button>
              </div>
            </div>

            {quickAddCatOpen && (
              <div className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/5 p-2 animate-in fade-in">
                <input
                  type="text"
                  value={quickCatInput}
                  onChange={(e) => setQuickCatInput(e.target.value)}
                  placeholder="New category name (e.g. Desserts)..."
                  className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const trimmed = quickCatInput.trim();
                      if (trimmed) {
                        globalActions.addCategory(trimmed);
                        patch({ category: trimmed });
                        setQuickCatInput("");
                        setQuickAddCatOpen(false);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!quickCatInput.trim()}
                  onClick={() => {
                    const trimmed = quickCatInput.trim();
                    if (trimmed) {
                      globalActions.addCategory(trimmed);
                      patch({ category: trimmed });
                      setQuickCatInput("");
                      setQuickAddCatOpen(false);
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="size-3" /> Add
                </button>
              </div>
            )}

            <div className="relative">
              <select
                value={draft.category}
                onChange={(e) => patch({ category: e.target.value })}
                className="w-full rounded-xl border border-input bg-card text-foreground px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary [&>option]:bg-zinc-900 [&>option]:text-zinc-100 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100 cursor-pointer shadow-xs"
              >
                {categories.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className="bg-zinc-900 text-zinc-100 py-1.5 font-medium"
                  >
                    {categoryNames[c] || c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-xs text-muted-foreground">
            Description
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={3}
              placeholder="Grilled teriyaki chicken with warm rice and pickles."
              className={fieldClass}
            />
          </label>

          <label className="block text-xs text-muted-foreground">
            Badges (comma-separated)
            <input
              value={draft.badges}
              onChange={(e) => patch({ badges: e.target.value })}
              placeholder="Halal-friendly, Spicy"
              className={fieldClass}
            />
          </label>

          {/* Toggles: Availability & Special Request */}
          <div className="space-y-2 pt-1">
            {/* Availability status */}
            <button
              type="button"
              onClick={() => patch({ available: !draft.available })}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs"
            >
              <span className="font-semibold text-foreground">Menu Availability</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  draft.available
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {draft.available ? "Available" : "Sold Out"}
              </span>
            </button>

            {/* Special Request / Notes Toggle */}
            <button
              type="button"
              onClick={() => patch({ specialRequestEnabled: !draft.specialRequestEnabled })}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs transition hover:bg-secondary/60"
            >
              <div className="flex items-center gap-2 text-left">
                <MessageSquare className="size-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Customer Special Request</p>
                  <p className="text-[10px] text-muted-foreground">
                    Allow custom kitchen notes on ordering modal
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                  draft.specialRequestEnabled
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {draft.specialRequestEnabled ? "Enabled" : "Disabled"}
              </span>
            </button>
          </div>

          {/* CUSTOMIZATION GROUPS MANAGEMENT */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Customization Groups</span>
              </div>
              <button
                type="button"
                onClick={addGroup}
                className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
              >
                <Plus className="size-3.5" /> Add Group
              </button>
            </div>

            {draft.groups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-3 text-center text-[11px] text-muted-foreground">
                No option groups configured. Click <strong>+ Add Group</strong> to configure sizes,
                toppings, or spice levels.
              </div>
            ) : (
              <div className="space-y-3">
                {draft.groups.map((group, gIdx) => (
                  <div
                    key={group.id}
                    className={`rounded-xl border p-3 transition ${
                      group.enabled
                        ? "border-border bg-card shadow-sm"
                        : "border-dashed border-border/70 bg-muted/20 opacity-75"
                    }`}
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                          {gIdx + 1}
                        </span>
                        <input
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                          placeholder="Group name (e.g. Size, Topping, Spice Level) *"
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Single vs Multi Selector */}
                        <select
                          value={group.type}
                          onChange={(e) =>
                            updateGroup(group.id, {
                              type: e.target.value as "single" | "multi",
                            })
                          }
                          className="rounded-lg border border-input bg-background px-2 py-1 text-[11px] font-medium outline-none focus:border-primary"
                        >
                          <option value="single">Single (Radio)</option>
                          <option value="multi">Multi (Checkbox)</option>
                        </select>

                        {/* Enable/Disable Toggle */}
                        <button
                          type="button"
                          onClick={() => updateGroup(group.id, { enabled: !group.enabled })}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                            group.enabled
                              ? "bg-success/15 text-success hover:bg-success/25"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {group.enabled ? "Active" : "Off"}
                        </button>

                        {/* Delete Group */}
                        <button
                          type="button"
                          onClick={() => removeGroup(group.id)}
                          aria-label={`Delete group ${group.name || gIdx + 1}`}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Choices / Options List */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground px-1">
                        <span>Option Name (Choice) *</span>
                        <span>Price (+{getCurrencySymbol()})</span>
                      </div>

                      {group.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <input
                            value={choice.name}
                            onChange={(e) =>
                              updateChoice(group.id, choice.id, { name: e.target.value })
                            }
                            placeholder="e.g. Regular, Fried Egg *"
                            className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs outline-none focus:border-primary"
                          />
                          <div className="relative w-24 shrink-0">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                              +{getCurrencySymbol()}
                            </span>
                            <input
                              value={choice.price}
                              onChange={(e) =>
                                updateChoice(group.id, choice.id, {
                                  price: e.target.value.replace(/\D/g, ""),
                                })
                              }
                              inputMode="numeric"
                              placeholder="0"
                              className="w-full rounded-lg border border-input bg-background pl-10 pr-2 py-1 text-xs text-right outline-none focus:border-primary"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChoice(group.id, choice.id)}
                            aria-label={`Remove option ${choice.name || ""}`}
                            disabled={group.choices.length <= 1}
                            className="rounded-lg p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addChoice(group.id)}
                        className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-0.5"
                      >
                        <Plus className="size-3" /> Add Choice Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="space-y-2.5 text-xs text-muted-foreground pt-1">
            <span className="font-semibold text-foreground">Menu Image</span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Dropzone & Upload Button */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:border-primary/60 hover:bg-secondary/50"
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Upload className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">
                Upload Image From Device (Phone / Laptop)
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Click or drag image file here (JPG, PNG, WEBP)
              </p>
            </div>

            {/* Preset Picker */}
            <div>
              <span className="text-[11px] text-muted-foreground">
                Or select from default presets:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {GALLERY.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => patch({ image: src })}
                    aria-label={`Select preset image ${i + 1}`}
                    aria-pressed={draft.image === src}
                    className={`size-12 overflow-hidden rounded-xl border-2 transition ${
                      draft.image === src
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={resolveMenuImage(src)}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e)}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL input fallback */}
            <label className="block text-[11px] text-muted-foreground pt-1">
              Or use your Media Library:
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  <ImageIcon className="size-4" /> Browse Media Library
                </button>
              </div>
            </label>

            <label className="block text-[11px] text-muted-foreground pt-3">
              Or paste an image URL:
              <div className="mt-1 flex items-center gap-2">
                <ImagePlus className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={draft.image}
                  onChange={(e) => patch({ image: e.target.value })}
                  placeholder="https://... (Image URL)"
                  className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </label>
          </div>

          {showGallery && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-bold">Media Library</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Select image for {draft.name || "item"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGallery(false)}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <MediaGallery
                    selectedUrl={draft.image}
                    onSelect={(url) => {
                      patch({ image: url });
                      setShowGallery(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {hasInvalidGroup && (
            <p className="text-[11px] text-destructive font-medium">
              * Please provide names for all customization groups and options.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              disabled={!valid}
              onClick={save}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              <Plus className="size-4" /> {editing ? "Save Changes" : "Add to Catalog"}
            </button>
            {editing && (
              <button
                onClick={() => setDraft(emptyDraft())}
                className="rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Customer Card Preview"
          description="How the item appears on the menu page."
        >
          <div className="w-44 overflow-hidden rounded-2xl border border-border bg-card">
            {draft.image ? (
              <img
                src={resolveMenuImage(draft.image)}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e)}
                className="h-28 w-full object-cover"
              />
            ) : (
              <div className="h-28 w-full bg-secondary" />
            )}
            <div className="space-y-1 p-3">
              <p className="text-sm font-semibold">{draft.name || "Item name"}</p>
              <p className="text-xs text-muted-foreground">
                {draft.price ? rupiah(Number(draft.price)) : rupiah(0)}
              </p>
              {draft.groups.length > 0 && (
                <p className="text-[10px] text-primary font-medium">
                  {draft.groups.filter((g) => g.enabled).length} option group(s) active
                </p>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 flex-1 py-0.5">
            {["All", ...categories].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "All" ? "All Items" : categoryNames[f] || f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/50 transition shadow-xs"
          >
            <FolderCog className="size-3.5 text-primary" />
            <span>Manage Categories</span>
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
            <Tag className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">No menu items found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filter !== "All"
                ? `There are no items in category "${categoryNames[filter] || filter}".`
                : "Your menu is currently empty. Add your first item on the left."}
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-1 md:grid-cols-2">
            {list.map((m) => (
              <div
                key={m.id}
                className="glow-card flex flex-wrap sm:flex-nowrap items-start gap-3 p-3"
              >
                {m.image ? (
                  <img
                    src={resolveMenuImage(m.image)}
                    alt={m.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e)}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="size-14 shrink-0 rounded-xl bg-secondary" />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{m.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {categoryNames[m.category] || m.category}
                    </span>{" "}
                    · {rupiah(m.price)}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span
                      className={`rounded px-1.5 py-0.5 font-medium ${
                        m.specialRequestEnabled !== false
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Notes: {m.specialRequestEnabled !== false ? "ON" : "OFF"}
                    </span>
                    {m.groups && m.groups.length > 0 && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
                        {m.groups.filter((g) => g.enabled !== false).length}/{m.groups.length}{" "}
                        groups ON
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{m.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0 self-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      m.available
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {m.available ? "Available" : "Sold Out"}
                  </span>
                  <button
                    onClick={() => setDraft(toDraft(m))}
                    aria-label={`Edit ${m.name}`}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => actions.deleteMenuItem(m.id)}
                    aria-label={`Delete ${m.name}`}
                    className="rounded-lg border border-border p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategorySelected={(cat) => {
          setFilter(cat);
          patch({ category: cat });
        }}
      />
    </div>
  );
}
