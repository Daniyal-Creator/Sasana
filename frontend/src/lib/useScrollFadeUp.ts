"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Options for the scroll-triggered fade-up animation.
 *
 * All defaults are chosen to stay within design-guardrails §7:
 * - M1: transform + opacity only
 * - M3: ≤400ms total (duration + stagger)
 * - M5: prefers-reduced-motion honored
 * - D5: no parallax
 *
 * @see docs/adr/0009-landing-scroll-fade-up.md
 */
export interface ScrollFadeUpOptions {
  /** CSS selector for child elements to animate (enables stagger). */
  selector?: string;
  /** Stagger delay between children in seconds. Default: 0.06 */
  stagger?: number;
  /** Starting translateY offset in pixels. Default: 12 */
  y?: number;
  /** Animation duration in seconds. Default: 0.35s (within M3 band) */
  duration?: number;
  /** ScrollTrigger start position. Default: "top 88%" */
  start?: string;
  /** ScrollTrigger end position. Default: "bottom 12%" */
  end?: string;
  /** ScrollTrigger toggle actions. Default: "play reverse play reverse" for bi-directional in/out */
  toggleActions?: string;
  /** Whether to trigger only once. Default: false */
  once?: boolean;
}

/**
 * Animate elements with a bi-directional fade-up entrance/exit when they enter or leave the viewport.
 *
 * Scoped to the landing page only (ADR-0009). Respects `prefers-reduced-motion`
 * by skipping all animation and showing elements immediately.
 *
 * Usage:
 * ```tsx
 * const ref = useScrollFadeUp<HTMLDivElement>();
 * return <div ref={ref}>…</div>;
 * ```
 */
export function useScrollFadeUp<T extends HTMLElement>(
  options: ScrollFadeUpOptions = {},
) {
  const containerRef = useRef<T>(null);
  const {
    selector,
    stagger = 0.06,
    y = 12,
    duration = 0.35,
    start = "top 88%",
    end = "bottom 12%",
    toggleActions = "play reverse play reverse",
    once = false,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // M5: respect prefers-reduced-motion — show elements immediately
    if (typeof window !== "undefined") {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) {
        const targets = selector
          ? container.querySelectorAll(selector.startsWith(">") ? `:scope ${selector}` : selector)
          : [container];
        targets.forEach((el) => {
          (el as HTMLElement).style.opacity = "1";
        });
        return;
      }
    }

    const scopedSelector = selector?.startsWith(">")
      ? `:scope ${selector}`
      : selector;

    // Determine animation targets
    const targets = scopedSelector
      ? container.querySelectorAll(scopedSelector)
      : container;

    // Set initial state
    gsap.set(targets, { opacity: 0, y });

    // Animate on scroll (bi-directional in/out)
    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration,
      ease: "power2.out",
      stagger: selector ? stagger : 0,
      scrollTrigger: {
        trigger: container,
        start,
        end,
        toggleActions,
        once,
      },
    });

    // Cleanup
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.killTweensOf(targets);
    };
  }, [selector, stagger, y, duration, start, end, toggleActions, once]);

  return containerRef;
}
