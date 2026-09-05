"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { getLenis } from "@/components/providers/SmoothScroll";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

/**
 * Floating scroll-down indicator. Appears when page content overflows the
 * viewport and hides once the user is near the bottom (<100px remaining).
 * Clicking it smooth-scrolls down by ~80% of the viewport height.
 */
export function ScrollIndicator() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);

  const update = useCallback(() => {
    const { scrollHeight } = document.documentElement;
    const viewportH = window.innerHeight;
    const scrolled = window.scrollY;

    // Content must overflow AND user must not be near the bottom.
    const overflows = scrollHeight > viewportH + 10; // small buffer
    const nearBottom = scrolled + viewportH >= scrollHeight - 100;

    setVisible(overflows && !nearBottom);
  }, []);

  useEffect(() => {
    // Initial check.
    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // Watch for DOM size changes (e.g. result card appearing).
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [update]);

  function scrollDown() {
    const target = window.scrollY + window.innerHeight * 0.8;

    // Lenis drives the scroll position itself; a native smooth scroll on top
    // of it stutters or gets overwritten outright.
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target);
      return;
    }

    // No Lenis means smooth scrolling is off — under `prefers-reduced-motion`,
    // in particular — so jump rather than animate (Guardrail §7 M5).
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target, behavior: prefersReduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollDown}
      aria-label={t(lang, "check.scrollDown")}
      className={[
        "fixed bottom-6 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center",
        "rounded-full bg-primary shadow-md hover:bg-primary-hover active:scale-95",
        "transition-[opacity,transform,background-color] duration-200 ease-out-quart",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <ArrowDown size={20} strokeWidth={2} aria-hidden className="text-primary-fg" />
    </button>
  );
}
