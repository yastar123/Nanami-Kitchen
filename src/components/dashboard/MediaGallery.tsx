import { useState, useRef } from "react";
import { Upload, X, Trash2, Eye, Check } from "lucide-react";
import { actions, useStore, uid, type MediaAsset } from "@/lib/store";
import { SectionCard } from "./DashboardShell";
import { compressImage } from "@/lib/image-compression";

interface MediaGalleryProps {
  onSelect?: (url: string) => void;
  selectedUrl?: string;
  closeOnSelect?: boolean;
}

export function MediaGallery({ onSelect, selectedUrl, closeOnSelect }: MediaGalleryProps) {
  const mediaAssets = useStore((s) => s.mediaAssets);
  const menu = useStore((s) => s.menu);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let url = "";
      try {
        url = await compressImage(file, 1000, 1000, 0.82);
      } catch (err) {
        void err;
      }

      if (!url) {
        url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve((event.target?.result as string) || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      }

      if (url) {
        const newAsset: MediaAsset = {
          id: "img-" + uid(),
          url,
          filename: file.name,
          uploadedAt: Date.now(),
          usedByMenuIds: [],
        };
        actions.saveMediaAsset(newAsset);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (asset: MediaAsset) => {
    if (asset.usedByMenuIds.length > 0) {
      const productNames = asset.usedByMenuIds
        .map((id) => menu.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ");

      alert(
        `Cannot delete image because it is used by: ${productNames}. Please remove the image from these products first.`,
      );
      console.log(
        `[DEBUG] Delete blocked for asset ${asset.id}. usedByMenuIds:`,
        asset.usedByMenuIds,
      );
      return;
    }

    if (confirm("Are you sure you want to delete this image?")) {
      actions.deleteMediaAsset(asset.id);
      console.log(`[DEBUG] Asset deleted: ${asset.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Upload New Media">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 hover:bg-secondary/50 cursor-pointer transition-colors"
        >
          <Upload className="size-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click to upload image</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max 5MB)</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          {uploading && <p className="text-xs text-primary mt-2 animate-pulse">Uploading...</p>}
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaAssets.map((asset) => (
          <div
            key={asset.id}
            className={`group relative aspect-square rounded-xl border overflow-hidden bg-secondary/20 transition-all ${
              selectedUrl === asset.url ? "ring-2 ring-primary border-primary" : "border-border"
            }`}
          >
            <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />

            {/* Selection indicator */}
            {selectedUrl === asset.url && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                <Check className="size-3" />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setPreviewAsset(asset)}
                className="p-1.5 bg-white text-black rounded-lg hover:bg-gray-100"
                title="Preview"
              >
                <Eye className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(asset)}
                className="p-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
              {onSelect && (
                <button
                  onClick={() => onSelect(asset.url)}
                  className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  title="Select"
                >
                  <Check className="size-4" />
                </button>
              )}
            </div>

            {/* Used by badge */}
            {asset.usedByMenuIds.length > 0 && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                In use
              </div>
            )}
          </div>
        ))}

        {mediaAssets.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed rounded-2xl">
            <p className="text-sm text-muted-foreground">No media assets found.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-background rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold truncate pr-8">{previewAsset.filename}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={previewAsset.url}
                alt={previewAsset.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4 bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                Uploaded: {new Date(previewAsset.uploadedAt).toLocaleString()}
              </p>
              {previewAsset.usedByMenuIds.length > 0 && (
                <p className="text-xs font-medium text-primary mt-1">
                  Used by:{" "}
                  {previewAsset.usedByMenuIds
                    .map((id) => menu.find((m) => m.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
