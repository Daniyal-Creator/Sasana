"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __sasanaLenis?: Lenis | null;
  }
}

/**
 * The running Lenis instance, or null when smooth scrolling is off — which is
 * the case under `prefers-reduced-motion`. Programmatic scrolling must go
 * through this: a native `scrollTo`/`scrollBy` fights Lenis' RAF loop and is
 * swallowed outright.
 *
 * The handle hangs off `window` rather than a module variable. SmoothScroll
 * renders nothing and sits beside the tree instead of wrapping it, so there is
 * no provider for a context to attach to, and Next.js reaches this file
 * through two client entries — the layout's boundary and ScrollIndicator's
 * import — which can leave each copy with its own module state. `window` is
 * the one object every copy agrees on.
 */
export function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  return window.__sasanaLenis ?? null;
}

/**
 * SmoothScroll provider using Lenis.
 *
 * Configured for calm, weighted inertial scrolling (Lerp 0.08, duration 1.2s, wheelMultiplier 0.9)
 * synchronized with GSAP ScrollTrigger and respecting prefers-reduced-motion (Guardrail §7 M5).
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
      infinite: false,
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    window.__sasanaLenis = lenis;

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      window.__sasanaLenis = null;
    };
  }, []);

  return null;
}
