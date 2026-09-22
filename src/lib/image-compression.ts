/**
 * Client-side image compression utility.
 * Resizes large camera/mobile uploads down to max 1000px and 82% quality JPEG,
 * reducing multi-megabyte files (3MB - 8MB) to ~50KB - 80KB.
 */
export async function compressImage(
  fileOrBase64: File | Blob | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82,
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    if (typeof fileOrBase64 === "string") return fileOrBase64;
    return "";
  }

  return new Promise((resolve) => {
    let src = "";
    let shouldRevoke = false;

    if (typeof fileOrBase64 === "string") {
      src = fileOrBase64;
    } else {
      try {
        src = URL.createObjectURL(fileOrBase64);
        shouldRevoke = true;
      } catch {
        // Fallback to FileReader if objectURL fails
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            compressImage(reader.result, maxWidth, maxHeight, quality).then(resolve);
          } else {
            resolve("");
          }
        };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
        return;
      }
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Only scale down if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(src);
          resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        if (shouldRevoke) URL.revokeObjectURL(src);
        resolve(compressed);
      } catch (err) {
        console.warn("[ImageCompression] Failed to compress on canvas:", err);
        if (shouldRevoke) URL.revokeObjectURL(src);
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      }
    };

    img.onerror = (err) => {
      console.warn("[ImageCompression] Failed to load image:", err);
      if (shouldRevoke) URL.revokeObjectURL(src);
      resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
    };

    img.src = src;
  });
}
