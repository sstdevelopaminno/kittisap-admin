"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicCart, PUBLIC_CART_UPDATED_EVENT } from "../../../lib/storefront/cart";
import {
  clearCustomerSessionActivity,
  isCustomerSessionExpired,
  markCustomerSessionActive,
  shouldRefreshCustomerSessionActivity,
} from "../../../lib/storefront/customer-session";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";

type AppLocale = "th" | "en" | "lo";

type MarketingTopNavProps = {
  locale: AppLocale;
  useLocalePrefix: boolean;
  brand: string;
  logoUrl?: string;
  nav: {
    home: string;
    products: string;
    pricing: string;
    contact: string;
    promotions?: string;
    auth?: string;
  };
  cta: {
    products?: string;
    call?: string;
    phone?: string;
  };
};

type PublicStorefrontResponse = {
  ok?: boolean;
  data?: {
    brandName?: string;
    callButtonLabel?: string;
    callPhone?: string;
    storefrontLogoUrl?: string;
  };
};

const localeFlagMap: Record<AppLocale, { code: string; flag: string; alt: string }> = {
  th: { code: "TH", flag: "🇹🇭", alt: "ภาษาไทย" },
  en: { code: "EN", flag: "🇬🇧", alt: "English" },
  lo: { code: "LO", flag: "🇱🇦", alt: "ພາສາລາວ" },
};

function withLocale(locale: AppLocale, path: string, useLocalePrefix: boolean) {
  if (!useLocalePrefix && locale === "th") {
    return path;
  }
  return `/${locale}${path}`;
}

function switchLocalePath(pathname: string, nextLocale: AppLocale) {
  const normalized = normalizePath(pathname);
  const segments = normalized.split("/").filter(Boolean);
  const current = segments[0];
  const hasPrefix = current === "th" || current === "en" || current === "lo";

  if (hasPrefix) {
    if (nextLocale === "th") {
      const rest = segments.slice(1).join("/");
      return rest ? `/${rest}` : "/";
    }
    segments[0] = nextLocale;
    return `/${segments.join("/")}`;
  }

  if (nextLocale === "th") {
    return normalized || "/";
  }
  return normalized === "/" ? `/${nextLocale}` : `/${nextLocale}${normalized}`;
}

function normalizePath(path: string) {
  if (!path) return "/";
  const noQuery = path.split("?")[0]?.split("#")[0] || "/";
  if (noQuery.length > 1 && noQuery.endsWith("/")) {
    return noQuery.slice(0, -1);
  }
  return noQuery;
}

function hasThaiChars(value: string) {
  return /[\u0E00-\u0E7F]/.test(value);
}

function localizeStorefrontText(raw: string | null | undefined, locale: AppLocale, fallback: string) {
  const value = String(raw ?? "").trim();
  if (!value) return fallback;
  if (locale === "th") return value;
  return hasThaiChars(value) ? fallback : value;
}

export function MarketingTopNav({ locale, useLocalePrefix, brand, logoUrl, nav, cta }: MarketingTopNavProps) {
  const router = useRouter();
  const pathname = normalizePath(usePathname() || withLocale(locale, "/", useLocalePrefix));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerInitial, setCustomerInitial] = useState("U");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [cartQty, setCartQty] = useState(0);
  const [brandOverride, setBrandOverride] = useState<string | null>(null);
  const [logoOverride, setLogoOverride] = useState<string | null>(null);
  const [callLabelOverride, setCallLabelOverride] = useState<string | null>(null);
  const [callPhoneOverride, setCallPhoneOverride] = useState<string | null>(null);
  const localeMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const localeMeta = localeFlagMap[locale];

  const homePath = withLocale(locale, "/", useLocalePrefix);
  const productsPath = withLocale(locale, "/products", useLocalePrefix);
  const pricingPath = withLocale(locale, "/pricing", useLocalePrefix);
  const contactPath = withLocale(locale, "/contact", useLocalePrefix);
  const promotionsPath = withLocale(locale, "/promotions", useLocalePrefix);
  const authPath = withLocale(locale, "/auth/login", useLocalePrefix);
  const accountPath = withLocale(locale, "/account", useLocalePrefix);
  const cartPath = withLocale(locale, "/cart", useLocalePrefix);
  const checkoutPath = withLocale(locale, "/checkout", useLocalePrefix);
  const authLabel = nav.auth ?? (locale === "th" ? "เข้าสู่ระบบ/สมัครสมาชิก" : locale === "lo" ? "ເຂົ້າລະບົບ/ສະໝັກສະມາຊິກ" : "Login/Register");
  const accountLabel = locale === "th" ? "บัญชีลูกค้า" : locale === "lo" ? "ບັນຊີລູກຄ້າ" : "Customer Account";
  const cartLabel = locale === "th" ? "ตะกร้า" : locale === "lo" ? "ກະຕ່າ" : "Cart";
  const checkoutLabel = locale === "th" ? "ชำระเงิน" : locale === "lo" ? "ຊຳລະເງິນ" : "Checkout";
  const logoutLabel = locale === "th" ? "ออกจากระบบ" : locale === "lo" ? "ອອກຈາກລະບົບ" : "Log out";
  const loggingOutLabel = locale === "th" ? "กำลังออกจากระบบ..." : locale === "lo" ? "ກຳລັງອອກຈາກລະບົບ..." : "Signing out...";
  const logoutConfirmTitle = locale === "th" ? "ยืนยันออกจากระบบ" : locale === "lo" ? "ຢືນຢັນອອກຈາກລະບົບ" : "Confirm sign out";
  const logoutConfirmDescription =
    locale === "th"
      ? "ต้องการออกจากระบบลูกค้าตอนนี้หรือไม่?"
      : locale === "lo"
        ? "ທ່ານຕ້ອງການອອກຈາກລະບົບລູກຄ້າຕອນນີ້ບໍ?"
        : "Do you want to sign out of your customer account now?";
  const logoutConfirmAction = locale === "th" ? "ยืนยัน" : locale === "lo" ? "ຢືນຢັນ" : "Confirm";
  const logoutCancelAction = locale === "th" ? "ยกเลิก" : locale === "lo" ? "ຍົກເລີກ" : "Cancel";
  const quickMenuLabel = locale === "th" ? "เมนูลัดลูกค้า" : locale === "lo" ? "ເມນູລັດລູກຄ້າ" : "Customer shortcuts";
  const languageLabel = locale === "th" ? "ภาษา" : locale === "lo" ? "ພາສາ" : "Language";
  const callPhone = callPhoneOverride ?? cta.phone ?? "+66843374982";
  const callHref = `tel:${callPhone}`;
  const callLabel = localizeStorefrontText(
    callLabelOverride,
    locale,
    cta.call ?? (locale === "th" ? "โทรหาเรา" : locale === "lo" ? "ໂທຫາພວກເຮົາ" : "Call Us"),
  );
  const onLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    setLocaleMenuOpen(false);
    router.push(switchLocalePath(pathname, nextLocale));
  };

  const handleCustomerLogout = useCallback(
    async (reason: "manual" | "expired" = "manual") => {
      if (loggingOut) return;

      setLoggingOut(true);
      setProfileMenuOpen(false);
      setMobileOpen(false);

      try {
        await getSupabaseBrowserClient().auth.signOut();
      } catch {
        // ignore logout errors and continue with local cleanup
      } finally {
        clearCustomerSessionActivity();
        setIsCustomerLoggedIn(false);
        setCustomerInitial("U");
        const target = reason === "expired" ? `${authPath}?error=session_expired` : authPath;
        router.replace(target);
        router.refresh();
        setLoggingOut(false);
      }
    },
    [authPath, loggingOut, router],
  );

  const requestCustomerLogout = useCallback(() => {
    if (loggingOut) return;
    setProfileMenuOpen(false);
    setMobileOpen(false);
    setLogoutConfirmOpen(true);
  }, [loggingOut]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("kittisap:mobile-top-menu", {
        detail: { open: mobileOpen },
      }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("kittisap:mobile-top-menu", {
          detail: { open: false },
        }),
      );
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!localeMenuRef.current?.contains(event.target as Node)) {
        setLocaleMenuOpen(false);
      }
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocaleMenuOpen(false);
        setProfileMenuOpen(false);
        setLogoutConfirmOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadStorefrontSettings() {
      try {
        const response = await fetch("/api/public/storefront-settings", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as PublicStorefrontResponse | null;
        if (!active || !response.ok || !payload?.ok || !payload.data) {
          return;
        }

        const nextBrand = String(payload.data.brandName ?? "").trim();
        const nextLogo = String(payload.data.storefrontLogoUrl ?? "").trim();
        const nextCallLabel = String(payload.data.callButtonLabel ?? "").trim();
        const nextCallPhone = String(payload.data.callPhone ?? "").trim();
        setBrandOverride(nextBrand || null);
        setLogoOverride(nextLogo || null);
        setCallLabelOverride(nextCallLabel || null);
        setCallPhoneOverride(nextCallPhone || null);
      } catch {
        // no-op fallback to static copy
      }
    }

    void loadStorefrontSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateCartQty = () => {
      const nextQty = getPublicCart().reduce((sum, item) => sum + item.qty, 0);
      setCartQty(nextQty);
    };

    updateCartQty();
    window.addEventListener("storage", updateCartQty);
    window.addEventListener(PUBLIC_CART_UPDATED_EVENT, updateCartQty as EventListener);
    return () => {
      window.removeEventListener("storage", updateCartQty);
      window.removeEventListener(PUBLIC_CART_UPDATED_EVENT, updateCartQty as EventListener);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function checkCustomerSession() {
      try {
        const response = await fetch("/api/customer/profile", { cache: "no-store" });
        if (!active) return;
        if (!response.ok) {
          setIsCustomerLoggedIn(false);
          setCustomerInitial("U");
          clearCustomerSessionActivity();
          return;
        }
        const payload = (await response.json()) as {
          ok?: boolean;
          data?: { full_name?: string | null };
        };
        const fullName = String(payload?.data?.full_name ?? "").trim();
        const initial = fullName ? fullName.charAt(0).toUpperCase() : "U";
        setIsCustomerLoggedIn(Boolean(payload?.ok));
        setCustomerInitial(initial);
      } catch {
        if (!active) return;
        setIsCustomerLoggedIn(false);
        setCustomerInitial("U");
        clearCustomerSessionActivity();
      }
    }

    void checkCustomerSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isCustomerLoggedIn) {
      return;
    }

    if (isCustomerSessionExpired()) {
      void handleCustomerLogout("expired");
      return;
    }

    markCustomerSessionActive();

    let closed = false;
    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];

    const onActivity = () => {
      if (!closed && shouldRefreshCustomerSessionActivity()) {
        markCustomerSessionActive();
      }
    };

    const checkSessionAge = () => {
      if (!closed && !loggingOut && isCustomerSessionExpired()) {
        closed = true;
        void handleCustomerLogout("expired");
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      checkSessionAge();
      onActivity();
    };

    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    const intervalId = window.setInterval(checkSessionAge, 60_000);

    return () => {
      closed = true;
      window.clearInterval(intervalId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [handleCustomerLogout, isCustomerLoggedIn, loggingOut]);

  const topMenu = [
    { href: homePath, label: nav.home },
    { href: productsPath, label: nav.products },
    { href: pricingPath, label: nav.pricing },
    { href: promotionsPath, label: nav.promotions ?? (locale === "th" ? "โปรโมชัน" : locale === "lo" ? "ໂປຣໂມຊັນ" : "Promotions") },
    { href: contactPath, label: nav.contact },
  ];
  if (!isCustomerLoggedIn) {
    topMenu.push({ href: authPath, label: authLabel });
  }

  return (
    <>
      <header className="kittisap-top-nav sticky top-0 z-[90] border-b border-[#d6aa59]/25 bg-[#070909]/95 text-amber-50 shadow-[0_15px_45px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 py-3 sm:px-6 xl:px-10">
        <Link href={homePath} className="flex shrink-0 items-center gap-3 text-sm font-extrabold tracking-[0.08em] text-[#f7e9c6] transition hover:text-[#e6b95b]" aria-label="Go to home">
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-[#e2ba69]/45 bg-black shadow-[0_0_24px_rgba(222,172,73,0.16)]">
            <Image src={logoOverride || logoUrl || "/icons/pwa-icon-192.png"} alt="" fill sizes="40px" className="object-contain" unoptimized priority />
          </span>
          <span>{brandOverride ?? brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Desktop top navigation">
          {topMenu.map((item) => {
            const normalizedHref = normalizePath(item.href);
            const active =
              normalizedHref === normalizePath(homePath)
                ? pathname === normalizePath(homePath)
                : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-press rounded-full px-3 py-2 text-xs font-bold tracking-wide transition ${
                  active ? "bg-[#d5a64f]/15 text-[#ffdb8b] ring-1 ring-[#d5a64f]/35" : "text-slate-200 hover:bg-white/10 hover:text-[#f5d28c]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div ref={localeMenuRef} className="relative hidden lg:block">
            <button
              type="button"
              aria-label="Select language"
              aria-haspopup="menu"
              aria-expanded={localeMenuOpen}
              onClick={() => setLocaleMenuOpen((prev) => !prev)}
              className="app-press inline-flex h-10 w-[88px] items-center rounded-full border border-[#dfb65f]/45 bg-[#161612] pl-2.5 pr-6 text-xs font-bold uppercase tracking-wide text-[#f5dfae] outline-none transition hover:border-[#f0cf88] hover:bg-[#252014] focus-visible:ring-2 focus-visible:ring-[#f6d794]"
            >
              <span className="mr-2 inline-flex items-center">
                <span role="img" aria-label={localeMeta.alt}>{localeMeta.flag}</span>
              </span>
              <span>{localeMeta.code}</span>
            </button>
            {localeMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-28 overflow-hidden rounded-xl border border-[#d1a454]/40 bg-[#121210] shadow-2xl">
                {(["th", "en", "lo"] as AppLocale[]).map((localeKey) => {
                  const optionMeta = localeFlagMap[localeKey];
                  const active = localeKey === locale;
                  return (
                    <button
                      key={localeKey}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => onLocaleChange(localeKey)}
                      className={`flex w-full items-center gap-2 px-2 py-2 text-left text-sm ${
                        active ? "bg-amber-500/20 text-amber-100" : "bg-[#121210] text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <span role="img" aria-label={optionMeta.alt}>{optionMeta.flag}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide">{optionMeta.code}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#dfb65f]">
              ▾
            </span>
          </div>
          {isCustomerLoggedIn ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="app-press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dcb563]/60 bg-[#30230f] text-xs font-extrabold text-[#ffe0a0] transition hover:bg-[#443219]"
                aria-label={accountLabel}
                title={accountLabel}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                {customerInitial}
              </button>
              {cartQty > 0 ? (
                <span className="pointer-events-none absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-4 text-zinc-900">
                  {cartQty > 99 ? "99+" : cartQty}
                </span>
              ) : null}
              {profileMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <Link
                    href={accountPath}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {accountLabel}
                  </Link>
                  <Link
                    href={cartPath}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {cartLabel}
                  </Link>
                  <Link
                    href={checkoutPath}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    {checkoutLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={requestCustomerLogout}
                    disabled={loggingOut}
                    className="block w-full border-t border-slate-200 px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loggingOut ? loggingOutLabel : logoutLabel}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <a
              href={callHref}
              className="app-press inline-flex rounded-full border border-[#e0b45b] bg-gradient-to-r from-[#f5d590] via-[#d7a548] to-[#bc8330] px-4 py-2.5 text-xs font-extrabold text-[#17130d] shadow-[0_8px_24px_rgba(213,165,72,0.16)] transition hover:brightness-110"
              aria-label={callLabel}
            >
              {callLabel}
            </a>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="marketing-top-nav-mobile"
            className="app-press inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5ab60]/45 bg-[#1a1814] text-[#f5d28c] lg:hidden"
          >
            <span className="text-lg leading-none">{mobileOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      <div
        id="marketing-top-nav-mobile"
        className={`fixed inset-x-0 top-[72px] z-[95] border-t border-[#d5ab60]/25 bg-[#0d0d0c] shadow-xl transition-[opacity,transform] duration-200 lg:hidden ${
          mobileOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <nav
          className="mx-auto flex max-h-[calc(100dvh-72px)] w-full max-w-[1680px] flex-col gap-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          aria-label="Mobile top navigation"
        >
          {topMenu.map((item) => {
            const normalizedHref = normalizePath(item.href);
            const active =
              normalizedHref === normalizePath(homePath)
                ? pathname === normalizePath(homePath)
                : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
            return (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`app-press rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          {isCustomerLoggedIn ? (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2">
              <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">{quickMenuLabel}</p>
              <div className="space-y-1">
                <Link
                  href={accountPath}
                  onClick={() => setMobileOpen(false)}
                  className="app-press block rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {accountLabel}
                </Link>
                <Link
                  href={cartPath}
                  onClick={() => setMobileOpen(false)}
                  className="app-press flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>{cartLabel}</span>
                  {cartQty > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-5 text-zinc-900">
                      {cartQty > 99 ? "99+" : cartQty}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={checkoutPath}
                  onClick={() => setMobileOpen(false)}
                  className="app-press block rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400"
                >
                  {checkoutLabel}
                </Link>
                <button
                  type="button"
                  onClick={requestCustomerLogout}
                  disabled={loggingOut}
                  className="app-press block w-full rounded-md border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loggingOut ? loggingOutLabel : logoutLabel}
                </button>
              </div>
            </div>
          ) : null}
          <div className="mt-3 rounded-xl border border-[#b48b42]/30 bg-[#1b1914] p-2">
            <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200/70">{languageLabel}</p>
            <div id="mobile-locale-select" className="grid grid-cols-3 gap-2">
              {(["th", "en", "lo"] as AppLocale[]).map((localeKey) => {
                const optionMeta = localeFlagMap[localeKey];
                const active = localeKey === locale;
                return (
                  <button
                    key={`mobile-locale-${localeKey}`}
                    type="button"
                    onClick={() => {
                      onLocaleChange(localeKey);
                      setMobileOpen(false);
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#e7bc67] bg-[#6a491d] text-amber-100 shadow-lg"
                        : "border-[#6b5830] bg-[#161614] text-amber-50 hover:border-[#e4b860] hover:bg-[#2c2416]"
                    }`}
                  >
                    <span role="img" aria-label={optionMeta.alt}>{optionMeta.flag}</span>
                    <span className="uppercase tracking-wide">{optionMeta.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
      </header>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu backdrop"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[65px] z-[80] bg-slate-900/30 backdrop-blur-[1px] md:hidden"
        />
      ) : null}
      {logoutConfirmOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={logoutCancelAction}
            onClick={() => setLogoutConfirmOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-2xl border border-amber-300/35 bg-[#0b0f18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <h2 className="text-lg font-semibold text-amber-200">{logoutConfirmTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200/85">{logoutConfirmDescription}</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                disabled={loggingOut}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-500/40 bg-slate-800/70 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutCancelAction}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  void handleCustomerLogout("manual");
                }}
                disabled={loggingOut}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-300/50 bg-rose-500/90 px-4 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? loggingOutLabel : logoutConfirmAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
