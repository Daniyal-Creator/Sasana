"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { SourceReference } from "@/components/assistant/SourceReference";
import { AmenityList } from "@/components/assistant/AmenityList";
import { ImagePreviewModal } from "@/components/assistant/ImagePreviewModal";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { Amenity, ChatKind } from "@shared/contract";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
  source?: string | null;
  kind?: ChatKind;
  /** Present only on a map answer, and only when the lookup found something. */
  amenities?: Amenity[];
  isFirstOfTurn?: boolean;
}

export function SasanaAvatar({ size = "md" }: { size?: "md" | "lg" }) {
  const isLg = size === "lg";
  return (
    <span
      aria-hidden
      className={[
        "relative flex shrink-0 items-center justify-center",
        isLg ? "h-16 w-16" : "h-7 w-7",
      ].join(" ")}
    >
      {/* Sized by width/height alone. `h-full w-full` said the same thing a
          second time, through the parent, and the two disagreeing for a frame
          is what Next reads as a broken aspect ratio. */}
      <Image
        src="/sasana-logo.png"
        alt="Sasana"
        width={isLg ? 64 : 28}
        height={isLg ? 64 : 28}
        priority={isLg}
      />
    </span>
  );
}

export function ChatBubble({
  role,
  content,
  imageUrl,
  source,
  kind,
  amenities,
  isFirstOfTurn = true,
}: ChatBubbleProps) {
  const { lang } = useLang();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isUser = role === "user";

  return (
    <li className={`flex items-end gap-2 animate-msgIn ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (isFirstOfTurn ? <SasanaAvatar /> : <span aria-hidden className="w-7 shrink-0" />)}
      <div
        className={[
          "max-w-[85%] rounded-lg px-4 py-3 md:max-w-[75%]",
          isUser
            ? "rounded-br-sm bg-primary text-primary-fg"
            : "rounded-bl-sm border border-border bg-surface text-text",
        ].join(" ")}
      >
        <span className="sr-only">{t(lang, isUser ? "sr.you" : "sr.assistant")}: </span>
        {imageUrl && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              aria-label={t(lang, "assistant.photo.view")}
              className="group relative block w-full overflow-hidden rounded-md border border-border/30 text-left transition-transform duration-150 active:scale-[0.99] focus-visible:shadow-focus cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={t(lang, "check.photo.alt")}
                className="max-h-48 w-full object-cover transition-opacity duration-150 group-hover:opacity-95"
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-text/75 px-2 py-1 text-xs font-medium text-surface shadow-sm transition-colors duration-150 group-hover:bg-text/90">
                <Maximize2 size={12} strokeWidth={1.75} aria-hidden />
                <span>{t(lang, "assistant.photo.view")}</span>
              </span>
            </button>
            <ImagePreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              imageUrl={imageUrl}
              altText={t(lang, "check.photo.alt")}
            />
          </div>
        )}
        <p className="whitespace-pre-wrap text-base">{content}</p>
        {/* Above the attribution, not below it: the credit line closes the
            answer, and the places are part of what is being credited. */}
        {!isUser && amenities && amenities.length > 0 && <AmenityList amenities={amenities} />}
        {!isUser && kind !== undefined && <SourceReference source={source ?? null} kind={kind} />}
      </div>
    </li>
  );
}
