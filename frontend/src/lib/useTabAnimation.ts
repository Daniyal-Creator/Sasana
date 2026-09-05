"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface TabAnimationOptions {
  /**
   * Value that changes when a tab is selected (e.g. activeTab, activeIndex).
   * Whenever this value changes, the animation is triggered.
   */
  trigger: unknown;
  /**
   * CSS selector for child elements to animate (e.g., "[data-tab-item]" or "> *").
   * If omitted, animates the container itself.
   */
  selector?: string;
  /**
   * Starting translateY offset in pixels.
   * Guardrail M1 / M3 compliant: Subtle movement (default: 8px).
   */
  y?: number;
  /**
   * Animation duration in seconds (default: 0.26s).
   * Guardrail M3 compliant (≤400ms).
   */
  duration?: number;
  /**
   * Stagger delay between sequential items in seconds (default: 0.04s).
   */
  stagger?: number;
  /**
   * GSAP easing function (default: "power2.out").
   * Guardrail M2 compliant (no bounce/spring).
   */
  ease?: string;
  /**
   * Whether to animate on initial component mount (default: false).
   * Keeping false prevents layout flash if initial view is already managed or static.
   */
  animateOnMount?: boolean;
}

/**
 * Hook to smoothly animate content in whenever an active tab changes.
 *
 * Adheres strictly to design-guardrails §7 (Motion):
 * - M1: Transform (translateY) and opacity only.
 * - M2: Calm easing ("power2.out"), no bounce or overshoot.
 * - M3: Fast, snappy response (duration + stagger <= 350ms).
 * - M5: Fully respects `prefers-reduced-motion`.
 */
export function useTabAnimation<T extends HTMLElement>(
  options: TabAnimationOptions,
) {
  const containerRef = useRef<T>(null);
  const isFirstRender = useRef(true);

  const {
    trigger,
    selector,
    y = 8,
    duration = 0.26,
    stagger = 0.04,
    ease = "power2.out",
    animateOnMount = false,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip initial mount animation if animateOnMount is false
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!animateOnMount) return;
    }

    // M5: Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;
    }

    const scopedSelector = selector?.startsWith(">")
      ? `:scope ${selector}`
      : selector;

    const targets = scopedSelector
      ? container.querySelectorAll(scopedSelector)
      : [container];

    if (!targets || targets.length === 0) return;

    const ctx = gsap.context(() => {
      // Kill any in-flight tweens on these elements to ensure rapid clicks don't glitch
      gsap.killTweensOf(targets);

      // Animate smoothly from subtle offset to normal position
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: selector ? stagger : 0,
          ease,
          clearProps: "transform,opacity",
        },
      );
    }, container);

    return () => {
      ctx.revert();
    };
  }, [trigger, selector, y, duration, stagger, ease, animateOnMount]);

  return containerRef;
}
