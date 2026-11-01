"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

export type CinematicHeroSlide = {
  id: string;
  src: string;
  title: string;
  productHref: string;
};

type Props = {
  slides: CinematicHeroSlide[];
  locale: "th" | "en" | "lo";
  videoUrl?: string | null;
};

const INTERVAL_MS = 6800;

export function PremiumHeroCarousel({ slides, locale, videoUrl }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [motionOK, setMotionOK] = useState(false);
  const [foregroundReady, setForegroundReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const next = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);
  const previous = useCallback(() => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const refreshMotion = () => setMotionOK(!media.matches);
    refreshMotion();
    media.addEventListener("change", refreshMotion);
    return () => media.removeEventListener("change", refreshMotion);
  }, []);

  useEffect(() => {
    if (!motionOK || paused || interacting || hidden || slides.length < 2) return;
    const timer = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, motionOK, next, paused, interacting, hidden, slides.length]);

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.visibilityState === "hidden");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // A small client-only pointer offset creates a depth illusion without WebGL
  // or heavy 3D assets. Reduced-motion users receive a static composition.
  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!motionOK) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rootRef.current?.style.setProperty("--hero-depth-x", `${(x * 13).toFixed(1)}px`);
    rootRef.current?.style.setProperty("--hero-depth-y", `${(y * 8).toFixed(1)}px`);
  };

  const onLeave = () => {
    rootRef.current?.style.setProperty("--hero-depth-x", "0px");
    rootRef.current?.style.setProperty("--hero-depth-y", "0px");
    setInteracting(false);
  };

  const changeTo = (index: number) => {
    setActiveIndex(index);
    setForegroundReady(false);
  };

  const sliderLabels = locale === "th"
    ? { prev: "ภาพก่อนหน้า", next: "ภาพถัดไป", pause: "หยุดสไลด์", play: "เล่นสไลด์", slide: "แสดงภาพ", view: "ดูรุ่นนี้" }
    : locale === "lo"
      ? { prev: "ພາບກ່ອນ", next: "ພາບຕໍ່ໄປ", pause: "ຢຸດສະໄລ", play: "ຫຼິ້ນສະໄລ", slide: "ເລືອກຮູບ", view: "ເບິ່ງລຸ້ນນີ້" }
      : { prev: "Previous image", next: "Next image", pause: "Pause slides", play: "Play slides", slide: "Show image", view: "Explore this model" };

  const isVideo = Boolean(videoUrl && /^https:\/\//i.test(videoUrl) && /\.(mp4|webm)(?:[?#]|$)/i.test(videoUrl));

  if (slides.length === 0 && !isVideo) {
    return (
      <div className="premium-hero-no-media absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="premium-hero-atmosphere absolute inset-0" />
        <div className="premium-hero-grid absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="premium-hero-slider absolute inset-0 overflow-hidden"
      aria-roledescription="carousel"
      aria-label={locale === "th" ? "ภาพรถ ATV แบบสไลด์" : "ATV showcase carousel"}
      onMouseMove={onMove}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={onLeave}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      onTouchStart={(event) => { touchStartRef.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const from = touchStartRef.current;
        touchStartRef.current = null;
        if (from === null || slides.length < 2) return;
        const distance = (event.changedTouches[0]?.clientX ?? from) - from;
        if (distance > 65) previous();
        if (distance < -65) next();
      }}
    >
      <div className="premium-hero-atmosphere absolute inset-0" aria-hidden="true" />
      {isVideo && !videoFailed ? (
        <video
          className="premium-hero-video absolute inset-0 h-full w-full object-cover"
          src={videoUrl!}
          autoPlay={motionOK}
          muted
          loop
          playsInline
          preload="metadata"
          poster={slides[0]?.src}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        />
      ) : null}
      {(slides.length ? slides : []).map((slide, i) => {
        const selected = i === activeIndex;
        return (
          <div
            key={slide.id}
            className={`premium-hero-slide absolute inset-0 ${selected ? "premium-hero-slide-active" : ""}`}
            aria-hidden={!selected}
          >
            <div className="premium-slide-background absolute inset-[-4%]">
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
                quality={65}
              />
            </div>
            <div className="premium-slide-scene absolute inset-0">
              <div className="premium-slide-aura absolute inset-0" />
              <div className="premium-slide-ground absolute bottom-0 right-0" />
              <div className="premium-slide-vehicle absolute inset-y-0 right-0">
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 87vw, 68vw"
                  className="object-contain object-center"
                  priority={i === 0}
                  quality={85}
                  onLoad={() => { if (selected) setForegroundReady(true); }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="premium-hero-slider-shade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="premium-hero-light-beam pointer-events-none absolute inset-0" aria-hidden="true" />
      {slides.length > 1 ? (
        <div className="premium-carousel-controls absolute bottom-[102px] right-5 z-20 flex items-center gap-2 sm:right-8 lg:bottom-[110px] lg:right-14">
          <button type="button" onClick={previous} className="premium-carousel-arrow" aria-label={sliderLabels.prev}>‹</button>
          <div className="flex items-center gap-2 px-1" role="group" aria-label={sliderLabels.slide}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`premium-carousel-dot ${activeIndex === i ? "premium-carousel-dot-active" : ""}`}
                onClick={() => changeTo(i)}
                aria-label={`${sliderLabels.slide} ${i + 1}: ${slide.title}`}
                aria-current={activeIndex === i ? "true" : undefined}
              >
                <span className="sr-only">{slide.title}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={next} className="premium-carousel-arrow" aria-label={sliderLabels.next}>›</button>
          <button type="button" onClick={() => setPaused((value) => !value)} className="premium-carousel-arrow premium-carousel-pause" aria-label={paused ? sliderLabels.play : sliderLabels.pause}>
            {paused ? "▶" : "Ⅱ"}
          </button>
        </div>
      ) : null}
      {slides.length > 0 ? (
        <div className="premium-carousel-caption absolute bottom-[159px] right-5 z-20 max-w-[min(48%,400px)] text-right sm:right-8 lg:bottom-[171px] lg:right-14">
          <span className="text-[10px] font-black uppercase tracking-[.23em] text-[#e8bb68]">
            ATV COLLECTION / {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <Link
            href={slides[activeIndex]?.productHref ?? "#updates"}
            className="mt-2 block line-clamp-2 text-sm font-extrabold text-[#fff3d7] transition hover:text-[#f1c46e] sm:text-base"
          >
            {slides[activeIndex]?.title}
            <span className="ml-2 text-[#d6ac62]" aria-hidden="true">↗</span>
          </Link>
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {slides.length > 0 ? `${sliderLabels.slide} ${activeIndex + 1} / ${slides.length}: ${slides[activeIndex]?.title}` : ""}
      </span>
      <div className={`premium-hero-load-signal ${foregroundReady ? "is-ready" : ""}`} aria-hidden="true" />
    </div>
  );
}
