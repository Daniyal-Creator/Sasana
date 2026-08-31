"use client";

/**
 * Decorative background for the assistant page.
 * ADR-0011 carve-out: abstract geometric SVGs at ≤8% opacity.
 * Both elements are pointer-events: none and aria-hidden.
 */
export function DecorativeBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Geometric pattern — bottom-left (ADR-0011) */}
      <div
        className="absolute -bottom-8 -left-8 h-[420px] w-[420px] opacity-[0.06]"
        style={{
          backgroundImage: "url(/assets/balinese-pattern.svg)",
          backgroundSize: "420px",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Abstract mandala — top-right (ADR-0011) */}
      <div
        className="absolute -right-12 -top-12 h-[400px] w-[400px] opacity-[0.06]"
        style={{
          backgroundImage: "url(/assets/mandala-decoration.svg)",
          backgroundSize: "400px",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
