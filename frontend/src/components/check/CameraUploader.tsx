"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { prepareImage, validateImage, type PreparedImage } from "@/lib/image";

interface CameraUploaderProps {
  image: PreparedImage | null;
  onImageReady: (image: PreparedImage) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function CameraUploader({ image, onImageReady, onClear, disabled = false }: CameraUploaderProps) {
  const { lang } = useLang();
  const [error, setError] = useState<"type" | "size" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || disabled) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onImageReady(await prepareImage(file));
  }

  if (image) {
    return (
      <div className="animate-fadeUp">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.previewUrl}
            alt={t(lang, "check.photo.alt")}
            className={`max-h-80 w-full object-cover ${disabled ? "opacity-60" : ""}`}
          />
          {!disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label={t(lang, "check.upload.clear")}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm transition-colors duration-150 hover:text-text"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-2 truncate text-xs text-text-muted">{image.name}</p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={[
          "flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center",
          "transition-colors duration-150 ease-out",
          dragOver ? "border-primary bg-primary-tint" : "border-border-strong bg-transparent",
        ].join(" ")}
      >
        <ImageIcon size={30} strokeWidth={1.5} aria-hidden className="text-text-muted" />
        <div>
          <p className="text-sm font-semibold text-text sm:text-base">{t(lang, "check.upload.prompt")}</p>
          <p className="mt-0.5 text-xs text-text-muted">{t(lang, "check.upload.hint")}</p>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={Camera}
            disabled={disabled}
            onClick={() => cameraInput.current?.click()}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium shadow-sm hover:bg-surface-sunken"
          >
            {t(lang, "check.upload.take")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            disabled={disabled}
            onClick={() => galleryInput.current?.click()}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium shadow-sm hover:bg-surface-sunken"
          >
            {t(lang, "check.upload.pick")}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-status-bad-fg">
          {t(lang, error === "type" ? "check.upload.errorType" : "check.upload.errorSize")}
        </p>
      )}

      <input
        ref={cameraInput}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="sr-only"
        aria-label={t(lang, "check.upload.take")}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInput}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-label={t(lang, "check.upload.pick")}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
