"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { CopyKey } from "@/lib/i18n";

/**
 * A viewfinder inside the page, rather than the operating system's camera app.
 *
 * `<input capture>` was the whole of "Take photo" before this, and it is a hint
 * a browser is free to ignore: every desktop browser does, so the button opened
 * a file dialog and the label was a lie. getUserMedia works the same way on a
 * laptop webcam and a phone, so the button now means what it says on both.
 *
 * The native input has not been deleted - it is the fallback below, for the
 * three ways this can fail that are all perfectly normal on a visitor's phone.
 */

type Phase = "starting" | "live" | "error";

/** Why the camera is unavailable. Each one gets its own sentence, not a shrug. */
type Failure = "denied" | "none" | "insecure" | "failed";

const FAILURE_COPY: Record<Failure, CopyKey> = {
  denied: "check.camera.denied",
  none: "check.camera.none",
  insecure: "check.camera.insecure",
  failed: "check.camera.failed",
};

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  /** Hands the visitor to the file picker when the camera cannot be used. */
  onFallback: () => void;
}

export function CameraCapture({ onCapture, onClose, onFallback }: CameraCaptureProps) {
  const { lang } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [failure, setFailure] = useState<Failure>("failed");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [canSwitch, setCanSwitch] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      // getUserMedia is absent, not merely refused, on a page served over plain
      // HTTP. Saying "permission denied" there sends the visitor to hunt
      // through browser settings for a switch that would not have helped.
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setFailure(window.isSecureContext ? "none" : "insecure");
        setPhase("error");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Autoplay can still be refused; the stream is live either way, so a
          // rejected play() is not worth failing the whole viewfinder over.
          videoRef.current.play().catch(() => {});
        }
        setPhase("live");

        // Only offered once a camera is already running: enumerateDevices
        // returns unlabelled placeholder entries before permission is granted,
        // so asking earlier would show the button on single-camera laptops.
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
        }
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        setFailure(
          name === "NotAllowedError" || name === "SecurityError"
            ? "denied"
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "none"
              : "failed",
        );
        setPhase("error");
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [facing, stop]);

  const close = useCallback(() => {
    stop();
    onClose();
  }, [onClose, stop]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        // A frame off a live stream carries no EXIF at all, which is why
        // buildPhotoMeta falls back to the clock for a camera photo.
        onCapture(new File([blob], `sasana-${stamp}.jpg`, { type: "image/jpeg" }));
        stop();
      },
      "image/jpeg",
      0.92,
    );
  }

  function useFallback() {
    stop();
    onFallback();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, "check.camera.title")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/45 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-tool overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fadeUp">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">{t(lang, "check.camera.title")}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t(lang, "check.camera.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-text focus-visible:shadow-focus"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {phase === "error" ? (
          <div className="px-4 py-8 sm:px-6">
            <p role="alert" className="text-sm text-text-secondary">
              {t(lang, FAILURE_COPY[failure])}
            </p>
            <Button variant="secondary" size="sm" icon={Upload} className="mt-4" onClick={useFallback}>
              {t(lang, "check.camera.fallback")}
            </Button>
          </div>
        ) : (
          <>
            <div className="relative bg-text">
              {/* A mirrored preview is what every phone shows for a selfie; the
                  captured frame is left unmirrored, which is what a camera saves. */}
              <video
                ref={videoRef}
                playsInline
                muted
                aria-label={t(lang, "check.camera.preview")}
                className={`aspect-[4/3] w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
              />
              {phase === "starting" && (
                <p
                  role="status"
                  className="absolute inset-0 flex items-center justify-center text-sm text-primary-fg"
                >
                  {t(lang, "check.camera.starting")}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="w-24">
                {canSwitch && (
                  <button
                    type="button"
                    onClick={() => setFacing(facing === "environment" ? "user" : "environment")}
                    aria-label={t(lang, "check.camera.switch")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-text focus-visible:shadow-focus"
                  >
                    <RefreshCw size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={capture}
                disabled={phase !== "live"}
                aria-label={t(lang, "check.camera.shutter")}
                className={[
                  "flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-[0.98]",
                  "focus-visible:shadow-focus",
                  phase === "live"
                    ? "bg-primary text-primary-fg hover:bg-primary-hover"
                    : "cursor-not-allowed bg-surface-sunken text-text-muted",
                ].join(" ")}
              >
                <Camera size={24} strokeWidth={1.75} aria-hidden />
              </button>

              <div className="flex w-24 justify-end">
                <button
                  type="button"
                  onClick={useFallback}
                  className="text-sm font-medium text-text-secondary underline underline-offset-4 transition-colors duration-150 hover:text-text focus-visible:shadow-focus"
                >
                  {t(lang, "check.camera.fallback")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
