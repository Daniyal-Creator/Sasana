import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SASANA",
  description: "Understand and respect Balinese customs, before you enter.",
};

export const viewport: Viewport = {
  // Mirrors the --color-bg token (tailwind.config.ts). Metadata for browser
  // chrome, not a style; documented audit exception per guardrails §10.2.
  themeColor: "#F6F1E9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>
        <SmoothScroll />
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
