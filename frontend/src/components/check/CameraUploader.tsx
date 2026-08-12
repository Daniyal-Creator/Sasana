"use client";

import { useRef, useState } from "react";
import { Camera, ImageUp, X } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
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
        <p className="mt-2 truncate text-sm text-text-muted">{image.name}</p>
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
          "flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center",
          "transition-colors duration-150 ease-out",
          dragOver ? "border-primary bg-primary-tint" : "border-border-strong bg-surface-sunken",
        ].join(" ")}
      >
        <ImageUp size={24} strokeWidth={1.75} aria-hidden className="text-text-muted" />
        <div>
          <p className="text-base font-medium text-text">{t(lang, "check.upload.prompt")}</p>
          <p className="mt-1 text-sm text-text-muted">{t(lang, "check.upload.hint")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={Camera}
            disabled={disabled}
            onClick={() => cameraInput.current?.click()}
          >
            {t(lang, "check.upload.take")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ImageUp}
            disabled={disabled}
            onClick={() => galleryInput.current?.click()}
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
