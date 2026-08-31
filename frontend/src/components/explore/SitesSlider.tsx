"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, ScrollText } from "lucide-react";
import { SITES, type Site } from "@/data/sites";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";

const AUTO_SLIDE_INTERVAL_MS = 5000;

export function SitesSlider() {
  const { lang } = useLang();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Staggered animations for slider header and card items
  const headerRef = useScrollFadeUp<HTMLDivElement>({
    selector: "> *",
    stagger: 0.06,
    y: 10,
  });
  const trackRef = useScrollFadeUp<HTMLDivElement>({
    selector: "[data-slide-item]",
    stagger: 0.07,
    y: 16,
  });

  // Update total pages and current active page based on scroll position
  const updatePagination = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const items = el.querySelectorAll<HTMLElement>("[data-slide-item]");
    if (items.length === 0) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = 20; // 1.25rem = 20px
    const visibleCount = Math.max(1, Math.round((clientWidth + gap) / (itemWidth + gap)));
    const pages = Math.max(1, Math.ceil(items.length / visibleCount));

    setTotalPages(pages);

    const maxScroll = Math.max(1, scrollWidth - clientWidth);
    const scrollProgress = Math.min(1, Math.max(0, scrollLeft / maxScroll));

    let activePage = 0;
    if (pages <= 1) {
      activePage = 0;
    } else {
      activePage = Math.min(pages - 1, Math.round(scrollProgress * (pages - 1)));
    }

    setCurrentPage(activePage);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updatePagination();

    const handleScroll = () => {
      updatePagination();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updatePagination);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updatePagination);
    };
  }, [updatePagination]);

  const scrollToPage = useCallback((pageIndex: number) => {
    const el = sliderRef.current;
    if (!el) return;

    const items = el.querySelectorAll<HTMLElement>("[data-slide-item]");
    if (items.length === 0) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = 20;
    const visibleCount = Math.max(1, Math.round((el.clientWidth + gap) / (itemWidth + gap)));

    const targetItemIndex = Math.min(items.length - 1, pageIndex * visibleCount);
    const targetItem = items[targetItemIndex];
    if (targetItem) {
      const targetLeft = targetItem.offsetLeft - el.offsetLeft;
      el.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
      setCurrentPage(pageIndex);
    }
  }, []);

  // Automatic slide interval every 2.5 seconds with loop-around to first slide
  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const nextPage = (currentPage + 1) % totalPages;
      scrollToPage(nextPage);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentPage, totalPages, isPaused, scrollToPage]);

  const handlePrev = () => {
    const prevPage = (currentPage - 1 + totalPages) % totalPages;
    scrollToPage(prevPage);
  };

  const handleNext = () => {
    const nextPage = (currentPage + 1) % totalPages;
    scrollToPage(nextPage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={t(lang, "sites_section.title")}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Section Header with Title & Navigation Controls */}
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-strong">
            {lang === "id" ? "LOKASI & ADAT" : "LOCATIONS & CUSTOMS"}
          </span>
          <h2 className="mt-2 font-display text-h2 font-semibold text-text">
            {t(lang, "sites_section.title")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {t(lang, "sites_section.subtitle")}
          </p>
        </div>

        {/* Prev / Next Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            disabled={totalPages <= 1}
            aria-label={t(lang, "sites_section.prev")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm transition-all duration-150 active:scale-95 hover:border-primary/50 hover:bg-surface-sunken hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
          >
            <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={totalPages <= 1}
            aria-label={t(lang, "sites_section.next")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm transition-all duration-150 active:scale-95 hover:border-primary/50 hover:bg-surface-sunken hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
          >
            <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div ref={trackRef} className="mt-8 relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          aria-label={t(lang, "sites_section.title")}
        >
          {SITES.map((site: Site, index: number) => {
            return (
              <div
                key={site.id}
                data-slide-item
                className="w-[86vw] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${SITES.length}: ${site.name}`}
              >
                <Link
                  href={`/explore/${site.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                  {/* Image Area */}
                  <div className="relative h-48 w-full shrink-0 overflow-hidden bg-surface-sunken sm:h-52">
                    {site.image ? (
                      <Image
                        src={site.image}
                        alt={site.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin size={24} strokeWidth={1.75} className="text-text-muted" aria-hidden />
                      </div>
                    )}

                    {/* Location Badge Overlay */}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-text-secondary shadow-sm">
                      <MapPin size={13} strokeWidth={1.75} className="text-accent-strong shrink-0" aria-hidden />
                      <span className="truncate max-w-[160px]">{site.region}</span>
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Site Name */}
                    <h3 className="font-display text-lg font-semibold text-text transition-colors duration-150 group-hover:text-primary sm:text-xl">
                      {site.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm line-clamp-3 flex-1">
                      {lang === "id" ? site.description.id : site.description.en}
                    </p>

                    {/* Divider Line */}
                    <div className="my-4 h-px w-full bg-border/70" aria-hidden />

                    {/* Card Bottom: Customs Count + CTA */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
                        <ScrollText size={13} strokeWidth={1.75} aria-hidden />
                        <span>{t(lang, "sites_section.customs_count", { count: String(site.customs.length) })}</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
                        <span>{t(lang, "sites_section.view")}</span>
                        <ChevronRight
                          size={15}
                          strokeWidth={2}
                          className="transition-transform duration-150 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {Array.from({ length: totalPages }).map((_, i: number) => {
            const isActive = currentPage === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToPage(i)}
                aria-label={`Slide ${i + 1} of ${totalPages}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-6 bg-primary"
                    : "w-2 bg-border-strong hover:bg-text-muted"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <p className="mt-3 text-center text-xs text-text-muted sm:hidden">
        {t(lang, "sites_section.slide_hint")}
      </p>
    </div>
  );
}
