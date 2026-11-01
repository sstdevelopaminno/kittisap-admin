import Image from "next/image";
import Link from "next/link";

import type { AppLocale } from "../../../lib/i18n/locale";
import type { WebBannerSettings } from "../../../lib/types/web-settings";

type PremiumHomeHeroProps = {
  settings: WebBannerSettings;
  locale: AppLocale;
  imageUrl: string | null;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  productsHref: string;
  contactHref: string;
};

export function PremiumHomeHero({
  settings,
  locale,
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  productsHref,
  contactHref,
}: PremiumHomeHeroProps) {
  const alignment =
    settings.contentAlign === "right"
      ? "items-end text-right"
      : settings.contentAlign === "center"
        ? "items-center text-center"
        : "items-start text-left";
  const buttonAlignment =
    settings.contentAlign === "right"
      ? "justify-end"
      : settings.contentAlign === "center"
        ? "justify-center"
        : "justify-start";
  const motionClass = settings.imageMotion === "none" ? "" : `banner-motion-${settings.imageMotion}`;
  const effectClass =
    settings.textEffect === "gradient"
      ? "bg-gradient-to-r from-[#fff4d3] via-[#e9bf6a] to-[#ae7c31] bg-clip-text text-transparent"
      : "";
  const effectStyle =
    settings.textEffect === "shadow"
      ? { textShadow: "0 8px 28px rgba(0,0,0,0.8)" }
      : settings.textEffect === "glow"
        ? { textShadow: "0 0 30px rgba(234,189,99,0.6)" }
        : undefined;
  const titleSize =
    locale === "th"
      ? Math.round(settings.titleFontSizePx * (settings.titleFontScaleThaiPercent / 100))
      : settings.titleFontSizePx;

  return (
    <section id="showroom" className="premium-hero relative isolate w-full overflow-hidden" aria-label={eyebrow}>
      <div
        className="premium-hero-media absolute inset-0"
        style={{
          background: `linear-gradient(125deg, ${settings.backgroundFrom}, ${settings.backgroundTo})`,
          borderColor: settings.imageFrameEnabled ? settings.imageFrameColor : "transparent",
          borderTopWidth: settings.imageFrameEnabled ? Math.min(settings.imageFrameBorderWidthPx, 4) : 0,
        }}
      >
        <div className="premium-hero-vehicle-aura pointer-events-none absolute inset-0" />
        {imageUrl ? (
          <div className="premium-hero-vehicle-stage absolute inset-y-0 right-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 65vw"
              className={`premium-hero-photo object-contain ${motionClass}`}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(205,151,49,0.48),transparent_45%),linear-gradient(125deg,#302213,#090909_75%)]" />
        )}
      </div>
      <div className="premium-hero-shade pointer-events-none absolute inset-0" />
      <div className="premium-hero-line pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex min-h-[650px] w-full max-w-[1680px] flex-col justify-center px-5 pb-32 pt-24 sm:px-8 lg:min-h-[min(850px,86svh)] lg:px-14 lg:pb-36">
        <div className={`flex w-full max-w-[860px] flex-col ${alignment}`}>
          <p
            className="premium-eyebrow"
            style={{ fontSize: `${Math.max(11, settings.eyebrowFontSizePx)}px` }}
          >
            <span className="premium-gold-dot" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1
            className={`premium-hero-title mt-6 max-w-[19ch] font-black leading-[1.12] tracking-tight ${effectClass}`}
            style={{
              fontSize: `clamp(38px, 5.6vw, ${Math.max(48, titleSize)}px)`,
              color: settings.textEffect === "gradient" ? undefined : "#fff7e7",
              ...effectStyle,
            }}
          >
            {title}
          </h1>
          <p
            className="premium-hero-description mt-6 max-w-[60ch] leading-relaxed"
            style={{ fontSize: `clamp(16px, 1.5vw, ${Math.max(17, settings.descriptionFontSizePx)}px)` }}
          >
            {description}
          </p>
          {settings.showButtons ? (
            <div className={`mt-9 flex w-full flex-wrap gap-3 ${buttonAlignment}`}>
              <Link href={productsHref} className="premium-button-gold inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-black">
                {primaryLabel} <span aria-hidden="true" className="ml-3 text-lg">↗</span>
              </Link>
              <Link href={contactHref} className="premium-button-outline inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-bold">
                {secondaryLabel}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="premium-hero-foot absolute bottom-6 left-5 right-5 flex flex-wrap items-center justify-between gap-3 sm:left-8 sm:right-8 lg:bottom-9 lg:left-14 lg:right-14">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-100/85">KITTISAP ATV · SHOWROOM</span>
          <Link href="#updates" className="inline-flex items-center gap-3 text-xs font-semibold text-slate-200 transition hover:text-[#f3d291]">
            {locale === "th" ? "สำรวจรุ่นสินค้า" : locale === "lo" ? "ເບິ່ງສິນຄ້າ" : "Explore the collection"}
            <span aria-hidden="true" className="premium-scroll-indicator">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
