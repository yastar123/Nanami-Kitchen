import fs from "node:fs";
import path from "node:path";
import { seedState } from "../lib/seed-data";
import type {
  MenuItem,
  Order,
  Voucher,
  Promo,
  Account,
  StaffMember,
  Settings,
  CmsContent,
  MediaAsset,
} from "../types";

export interface UserSessionData {
  id: string;
  accountId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

export interface StorageData {
  settings: Settings;
  cms: CmsContent;
  menu: MenuItem[];
  orders: Order[];
  promos: Promo[];
  vouchers: Voucher[];
  accounts: Account[];
  staff: StaffMember[];
  mediaAssets: MediaAsset[];
  sessions?: UserSessionData[];
}

const getCwd = () => {
  try {
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
      return process.cwd();
    }
  } catch {
    // fallback
  }
  return ".";
};

const DATA_DIR = path.resolve(getCwd(), ".server-data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

let memoryState: StorageData | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to create data directory:", e);
  }
}

export function getStorageData(): StorageData {
  if (memoryState) {
    return memoryState;
  }

  ensureDataDir();

  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<StorageData>;
      memoryState = {
        settings: {
          currencySymbol: "N$",
          ...(seedState.settings as Settings),
          ...(parsed.settings || {}),
        },
        cms: sanitizeCmsStorage(parsed.cms ?? (seedState.cms as CmsContent)),
        menu: Array.isArray(parsed.menu) ? parsed.menu : (seedState.menu ?? []),
        orders: Array.isArray(parsed.orders) ? parsed.orders : (seedState.orders ?? []),
        promos: Array.isArray(parsed.promos) ? parsed.promos : (seedState.promos ?? []),
        vouchers: Array.isArray(parsed.vouchers) ? parsed.vouchers : (seedState.vouchers ?? []),
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : (seedState.accounts ?? []),
        staff: Array.isArray(parsed.staff) ? parsed.staff : (seedState.staff ?? []),
        mediaAssets: Array.isArray(parsed.mediaAssets) ? parsed.mediaAssets : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      };
      return memoryState;
    } catch (e) {
      console.warn("Failed to parse nanami-db.json, falling back to seedState:", e);
    }
  }

  // Initialize from seedState
  const safeClone = <T>(val: T, fallback: T): T => {
    if (val === undefined || val === null) return fallback;
    try {
      return JSON.parse(JSON.stringify(val));
    } catch {
      return fallback;
    }
  };

  memoryState = {
    settings: safeClone(seedState.settings, {} as Settings),
    cms: safeClone(seedState.cms, {} as CmsContent),
    menu: safeClone(seedState.menu, []),
    orders: safeClone(seedState.orders, []),
    promos: safeClone(seedState.promos, []),
    vouchers: safeClone(seedState.vouchers, []),
    accounts: safeClone(seedState.accounts, []),
    staff: safeClone(seedState.staff, []),
    mediaAssets: [],
    sessions: [],
  };

  saveStorageToFile(memoryState);
  return memoryState;
}

function saveStorageToFile(data: StorageData): void {
  ensureDataDir();
  try {
    const tempFile = `${STORAGE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, STORAGE_FILE);
  } catch (e) {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write storage file:", err);
    }
  }
}

export function persistStorage(data: StorageData): void {
  memoryState = data;
  saveStorageToFile(data);
}

export function sanitizeCmsStorage(cms: CmsContent): CmsContent {
  if (!cms) return cms;
  const copy = { ...cms };
  if (
    copy.heroImage &&
    (copy.heroImage.includes("photo-test-") || copy.heroImage.includes("photo-audit-"))
  ) {
    copy.heroImage = "";
  }
  if (
    copy.welcomeScreen?.imageUrl &&
    (copy.welcomeScreen.imageUrl.includes("photo-test-") ||
      copy.welcomeScreen.imageUrl.includes("photo-audit-"))
  ) {
    copy.welcomeScreen = {
      ...copy.welcomeScreen,
      imageUrl: "",
    };
  }
  return copy;
}

export function saveMenuItemStorage(item: MenuItem): void {
  const current = getStorageData();
  const cleanItem = { ...item };
  // If incoming image is an alias like /api/media/menu-:id, preserve previous image if stored
  if (cleanItem.image && cleanItem.image.startsWith("/api/media/menu-")) {
    const prev = current.menu.find((m) => m.id === item.id);
    if (prev?.image && !prev.image.startsWith("/api/media/")) {
      cleanItem.image = prev.image;
    }
  }

  const exists = current.menu.some((m) => m.id === item.id);
  const updatedMenu = exists
    ? current.menu.map((m) => (m.id === item.id ? { ...m, ...cleanItem } : m))
    : [...current.menu, cleanItem];

  persistStorage({
    ...current,
    menu: updatedMenu,
  });
}

export function deleteMenuItemStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    menu: current.menu.filter((m) => m.id !== id),
  });
}

export function saveOrderStorage(order: Order): void {
  const current = getStorageData();
  const exists = current.orders.some((o) => o.id === order.id);
  const updatedOrders = exists
    ? current.orders.map((o) => (o.id === order.id ? order : o))
    : [order, ...current.orders];

  persistStorage({
    ...current,
    orders: updatedOrders,
  });
}

export function deleteOrderStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    orders: current.orders.filter((o) => o.id !== id),
  });
}

export function saveVoucherStorage(v: Voucher): void {
  const current = getStorageData();
  const exists = current.vouchers.some((x) => x.code === v.code);
  const updatedVouchers = exists
    ? current.vouchers.map((x) => (x.code === v.code ? v : x))
    : [...current.vouchers, v];

  persistStorage({
    ...current,
    vouchers: updatedVouchers,
  });
}

export function deleteVoucherStorage(code: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    vouchers: current.vouchers.filter((v) => v.code !== code),
  });
}

export function savePromoStorage(p: Promo): void {
  const current = getStorageData();
  const cleanPromo = { ...p };
  if (cleanPromo.imageUrl && cleanPromo.imageUrl.startsWith("/api/media/promo-")) {
    const prev = current.promos.find((x) => x.id === p.id);
    if (prev?.imageUrl && !prev.imageUrl.startsWith("/api/media/")) {
      cleanPromo.imageUrl = prev.imageUrl;
    }
  }

  const exists = current.promos.some((x) => x.id === p.id);
  const updatedPromos = exists
    ? current.promos.map((x) => (x.id === p.id ? cleanPromo : x))
    : [...current.promos, cleanPromo];

  persistStorage({
    ...current,
    promos: updatedPromos,
  });
}

export function deletePromoStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    promos: current.promos.filter((p) => p.id !== id),
  });
}

export function saveAccountStorage(acc: Account): void {
  const current = getStorageData();
  const exists = current.accounts.some(
    (a) => a.id === acc.id || a.email.toLowerCase() === acc.email.toLowerCase(),
  );
  const updatedAccounts = exists
    ? current.accounts.map((a) =>
        a.id === acc.id || a.email.toLowerCase() === acc.email.toLowerCase() ? acc : a,
      )
    : [...current.accounts, acc];

  persistStorage({
    ...current,
    accounts: updatedAccounts,
  });
}

export function deleteAccountStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    accounts: current.accounts.filter((a) => a.id !== id),
  });
}

export function saveStaffStorage(staffMember: StaffMember): void {
  const current = getStorageData();
  const exists = current.staff.some((s) => s.id === staffMember.id);
  const updatedStaff = exists
    ? current.staff.map((s) => (s.id === staffMember.id ? staffMember : s))
    : [staffMember, ...current.staff];

  persistStorage({
    ...current,
    staff: updatedStaff,
  });
}

export function deleteStaffStorage(idOrEmail: string): void {
  const current = getStorageData();
  const clean = idOrEmail.toLowerCase();
  persistStorage({
    ...current,
    staff: current.staff.filter((s) => s.id !== idOrEmail && s.email.toLowerCase() !== clean),
  });
}

export function saveSettingsStorage(settings: Settings): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    settings: { ...current.settings, ...settings },
  });
}

export function saveCmsStorage(cms: CmsContent): void {
  const current = getStorageData();
  const mergedCms = { ...current.cms, ...cms };

  // Preserve existing real images if incoming is an /api/media/ alias
  if (cms.logoUrl === "/api/media/cms-logo" && current.cms.logoUrl) {
    mergedCms.logoUrl = current.cms.logoUrl;
  }
  if (cms.heroImage === "/api/media/cms-hero" && current.cms.heroImage) {
    mergedCms.heroImage = current.cms.heroImage;
  }
  if (
    cms.welcomeScreen?.imageUrl === "/api/media/cms-welcome" &&
    current.cms.welcomeScreen?.imageUrl
  ) {
    mergedCms.welcomeScreen = {
      ...mergedCms.welcomeScreen,
      imageUrl: current.cms.welcomeScreen.imageUrl,
    };
  }

  // Filter out dummy test URLs from test suites
  if (
    mergedCms.heroImage?.includes("photo-test-") ||
    mergedCms.heroImage?.includes("photo-audit-")
  ) {
    mergedCms.heroImage = "";
  }
  if (
    mergedCms.welcomeScreen?.imageUrl?.includes("photo-test-") ||
    mergedCms.welcomeScreen?.imageUrl?.includes("photo-audit-")
  ) {
    mergedCms.welcomeScreen = {
      ...mergedCms.welcomeScreen,
      imageUrl: "",
    };
  }

  persistStorage({
    ...current,
    cms: mergedCms,
  });
}

export function saveMediaAssetStorage(media: MediaAsset): void {
  const current = getStorageData();
  const cleanMedia = { ...media };
  if (cleanMedia.url && cleanMedia.url.startsWith("/api/media/asset-")) {
    const prev = current.mediaAssets.find((m) => m.id === media.id);
    if (prev?.url && !prev.url.startsWith("/api/media/")) {
      cleanMedia.url = prev.url;
    }
  }

  const exists = current.mediaAssets.some((m) => m.id === media.id);
  const updatedMedia = exists
    ? current.mediaAssets.map((m) => (m.id === media.id ? cleanMedia : m))
    : [cleanMedia, ...current.mediaAssets];

  persistStorage({
    ...current,
    mediaAssets: updatedMedia,
  });
}

export function deleteMediaAssetStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    mediaAssets: current.mediaAssets.filter((m) => m.id !== id),
  });
}

export function updateMediaAssetUsageStorage(id: string, usedByMenuIds: string[]): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    mediaAssets: current.mediaAssets.map((m) => (m.id === id ? { ...m, usedByMenuIds } : m)),
  });
}

export function saveSessionStorage(session: UserSessionData): void {
  const current = getStorageData();
  const sessions = (current.sessions || []).filter((s) => s.id !== session.id);
  sessions.push(session);
  persistStorage({
    ...current,
    sessions,
  });
}

export function getSessionStorage(id: string): UserSessionData | null {
  if (!id) return null;
  const current = getStorageData();
  const session = (current.sessions || []).find((s) => s.id === id);
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    deleteSessionStorage(id);
    return null;
  }
  return session;
}

export function deleteSessionStorage(id: string): void {
  const current = getStorageData();
  persistStorage({
    ...current,
    sessions: (current.sessions || []).filter((s) => s.id !== id),
  });
}
