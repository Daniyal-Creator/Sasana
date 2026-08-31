import type { Config } from "tailwindcss";

// Token layer — the ONLY place color/type/radius/shadow values live (ui-spec §2, guardrails C1/C2).
export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    extend: {
      colors: {
        bg: "#F6F1E9",
        surface: "#FFFDF9",
        "surface-sunken": "#EFE8DC",
        border: { DEFAULT: "#E4DACB", strong: "#CBBFA8" },
        text: { DEFAULT: "#2A2520", secondary: "#5C544A", muted: "#8A8073" },
        primary: { DEFAULT: "#1D4E89", hover: "#163C6B", tint: "#E7EEF6", fg: "#FBFCFE" },
        accent: { DEFAULT: "#B8862B", strong: "#8A6416" },
        focus: "#3B6FB0",
        status: {
          "ok-fg": "#2E7D46", "ok-bg": "#E8F3EB", "ok-border": "#BEDDC6",
          "warn-fg": "#8A5A00", "warn-bg": "#FBF1DE", "warn-border": "#EEDBA8",
          "bad-fg": "#B23A2E", "bad-bg": "#FBEAE7", "bad-border": "#EEC4BD",
          "unknown-fg": "#6B6459", "unknown-bg": "#F0ECE4", "unknown-border": "#D9D1C4",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.55" }],
        lg: ["1.25rem", { lineHeight: "1.4" }],
        h3: ["1.563rem", { lineHeight: "1.2" }],
        h2: ["1.953rem", { lineHeight: "1.15" }],
        h1: ["2.488rem", { lineHeight: "1.1" }],
        display: ["2.986rem", { lineHeight: "1.05" }],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
      boxShadow: {
        sm: "0 1px 2px rgba(42,37,32,.05), 0 1px 3px rgba(42,37,32,.04)",
        md: "0 4px 12px rgba(42,37,32,.08)",
        lg: "0 12px 32px rgba(42,37,32,.14)",
        toast: "0 8px 24px rgba(42,37,32,.16)",
        focus: "0 0 0 3px rgba(59,111,176,.45)",
      },
      maxWidth: {
        tool: "600px",
        prose: "680px",
        container: "1120px",
        // Reading widths stop at `container`. The Explore Guide is a bento of
        // panels rather than prose, and at 1120 on a wide screen it reads as a
        // narrow column stranded in the middle of the page.
        wide: "1320px",
        hero: "520px",
        "assistant-main": "780px",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25,1,0.5,1)",
        "out-expo": "cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        resultIn: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        msgIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        dotPulse: { "0%,100%": { opacity: ".3" }, "50%": { opacity: "1" } },
        staggerIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        fadeUp: "fadeUp .2s cubic-bezier(0.25,1,0.5,1)",
        resultIn: "resultIn .32s cubic-bezier(0.25,1,0.5,1)",
        msgIn: "msgIn .24s cubic-bezier(0.25,1,0.5,1)",
        dotPulse: "dotPulse 1.2s ease-in-out infinite",
        staggerIn: "staggerIn .3s cubic-bezier(0.25,1,0.5,1) both",
      },
    },
  },
} satisfies Config;
