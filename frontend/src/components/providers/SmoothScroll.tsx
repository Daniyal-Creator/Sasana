"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    };
  }, []);

  return null;
}
