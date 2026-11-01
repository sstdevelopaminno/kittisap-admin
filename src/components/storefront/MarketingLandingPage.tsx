import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { listPublicProducts } from "../../../lib/db/publicProducts";
import {
  getWebBannerSettings,
  getWebStorefrontSettings,
  getWebHomepageAppearanceSettings,
  getWebHomepageImageStripSettings,
  getWebHomepagePopupSettings,
  getWebMiddleBannerSettings,
  getWebBrandGuaranteeSettings,
  getWebNewsCardsSettings,
  getWebWhyChooseUsSettings,
} from "../../../lib/db/web-settings";
import type { AppLocale } from "../../../lib/i18n/locale";
import {
  getDefaultWebBannerSettings,
  getDefaultWebStorefrontSettings,
  getDefaultWebHomepageAppearanceSettings,
  getDefaultWebHomepageImageStripSettings,
  getDefaultWebHomepagePopupSettings,
  getDefaultWebMiddleBannerSettings,
  getDefaultWebBrandGuaranteeSettings,
  getDefaultWebNewsCardsSettings,
  getDefaultWebWhyChooseUsSettings,
  WhyChooseUsIcon,
} from "../../../lib/types/web-settings";
import { ActivitiesNewsGrid } from "./ActivitiesNewsGrid";
import { FeaturedProductsLiveSection } from "./FeaturedProductsLiveSection";
import { MiddleBannerStrip } from "./MiddleBannerStrip";
import { MarketingTopNav } from "./MarketingTopNav";
import { NewsletterSubscribeSection } from "./NewsletterSubscribeSection";
import { HomepagePromoPopup } from "./HomepagePromoPopup";
import { PremiumHomeHero } from "./PremiumHomeHero";
import { StorefrontRealtimeRefresh } from "./StorefrontRealtimeRefresh";

type MarketingLandingPageProps = {
  locale: AppLocale;
  useLocalePrefix?: boolean;
  showOuterFrame?: boolean;
  showTopNav?: boolean;
};

function withLocale(locale: AppLocale, path: string, useLocalePrefix: boolean) {
  if (!useLocalePrefix && locale === "th") {
    return path;
  }
  return `/${locale}${path}`;
}

function hasThaiChars(value: string) {
  return /[\u0E00-\u0E7F]/.test(value);
}

function localizeSettingText(raw: string | null | undefined, locale: AppLocale, fallback: string) {
  const value = (raw ?? "").trim();
  if (!value) return fallback;
  if (locale === "th") return value;
  return hasThaiChars(value) ? fallback : value;
}

function copy(locale: AppLocale) {
  if (locale === "th") {
    return {
      brand: "Kittisap",
      nav: {
        home: "หน้าแรก",
        products: "สินค้าของเรา",
        pricing: "ตารางราคา",
        promotions: "กิจกรรม + ส่วนลด/คูปอง",
        contact: "ติดต่อเรา",
      },
      cta: {
        products: "ดูสินค้า",
      },
      hero: {
        eyebrow: "KITTISAP CUSTOMER SITE",
        title: "แพลตฟอร์มลูกค้า เชื่อมสินค้าและคำสั่งซื้อชุดเดียวกับระบบแอดมิน",
        desc: "ลูกค้าดูสินค้า ตารางราคา โปรโมชัน สั่งซื้อ และชำระเงินผ่าน PromptPay ได้ครบในระบบเดียว",
      },
      sections: {
        updates: "สินค้าแนะนำ",
        updatesSub: "",
        news: "กิจกรรมและข่าวสาร",
        newsSub: "อัปเดตโปรโมชันและคูปองล่าสุด",
      },
      tags: {
        latest: "Live Products",
        updates: "Promotions",
      },
      card: {
        model: "สินค้า",
        meta: "ราคา • สต็อก",
        article: "หัวข้อข่าว / กิจกรรม",
        articleMeta: "วันที่ • หมวดหมู่",
      },
      footer: {
        title: "Kittisap",
        desc1: "เว็บไซต์ลูกค้าเชื่อมข้อมูลร่วมกับระบบแอดมินและ Supabase",
        desc2: "รองรับการสั่งซื้อ ชำระเงิน และตรวจสอบคำสั่งซื้ออย่างครบวงจร",
        quick: "Quick Links",
        contact: "Contact",
        admin: "เข้าสู่ระบบแอดมิน",
        dev: "Developer Console",
      },
      whyItems: [
        {
          title: "รับประกันหลังการขาย มั่นใจได้ทุกการใช้งาน",
          description: "บริการรับประกันสินค้าอย่างชัดเจน ดูแลจริง ไม่ทอดทิ้งลูกค้า ให้คุณมั่นใจได้ว่าใช้งานต่อเนื่อง",
        },
        {
          title: "ดูแลต่อเนื่องแบบหมดประกัน",
          description: "หมดประกันแล้วก็ยังมีทีมซัพพอร์ตคอยดูแล พร้อมคำแนะนำการใช้งานและการบำรุงรักษา",
        },
        {
          title: "จัดส่งถึงที่ พร้อมรับประกันระหว่างขนส่ง",
          description: "จัดส่งทั่วประเทศ ดูแลสินค้าระหว่างขนส่ง พร้อมมาตรฐานความปลอดภัยทุกขั้นตอน",
        },
        {
          title: "บริการให้คำปรึกษาสำหรับตัวแทนจำหน่าย",
          description: "สนับสนุนตัวแทนจำหน่ายทั้งด้านข้อมูลสินค้า การขาย และการดูแลลูกค้า",
        },
      ],
      newsletter: {
        title: "รับข่าวสารและโปรโมชันล่าสุด",
        subtitle: "กรอกชื่อและอีเมลของคุณ เพื่อรับข้อเสนอพิเศษและอัปเดตกิจกรรมใหม่ก่อนใคร",
        nameLabel: "ชื่อ",
        emailLabel: "อีเมล",
        namePlaceholder: "ชื่อของคุณ",
        emailPlaceholder: "you@example.com",
        cta: "สมัครรับข่าวสาร",
        success: "สมัครรับข่าวสารเรียบร้อยแล้ว",
        error: "สมัครรับข่าวสารไม่สำเร็จ",
      },
    };
  }

  if (locale === "lo") {
    return {
      brand: "Kittisap",
      nav: {
        home: "ໜ້າຫຼັກ",
        products: "ສິນຄ້າຂອງພວກເຮົາ",
        pricing: "ຕາຕະລາງລາຄາ",
        promotions: "ກິດຈະກຳ + ຄູປອງ",
        contact: "ຕິດຕໍ່",
      },
      cta: {
        products: "ເບິ່ງສິນຄ້າ",
      },
      hero: {
        eyebrow: "KITTISAP CUSTOMER SITE",
        title: "ແພລດຟອມລູກຄ້າ ເຊື່ອມສິນຄ້າ ແລະຄໍາສັ່ງຊື້ກັບລະບົບແອດມິນ",
        desc: "ລູກຄ້າເລືອກເບິ່ງສິນຄ້າ ລາຄາ ໂປຣໂມຊັນ ສັ່ງຊື້ ແລະຊໍາລະເງິນໃນລະບົບດຽວ",
      },
      sections: {
        updates: "ສິນຄ້າແນະນໍາ",
        updatesSub: "",
        news: "ກິດຈະກໍາ ແລະຂ່າວສານ",
        newsSub: "ອັບເດດໂປຣໂມຊັນ ແລະຄູປອງຫຼ້າສຸດ",
      },
      tags: {
        latest: "Live Products",
        updates: "Promotions",
      },
      card: {
        model: "ສິນຄ້າ",
        meta: "ລາຄາ • ສະຕັອກ",
        article: "ຫົວຂໍ້ຂ່າວ / ກິດຈະກໍາ",
        articleMeta: "ວັນທີ • ໝວດໝູ່",
      },
      footer: {
        title: "Kittisap",
        desc1: "ເວັບໄຊລູກຄ້າເຊື່ອມຂໍ້ມູນກັບລະບົບແອດມິນ ແລະ Supabase",
        desc2: "ຮອງຮັບການສັ່ງຊື້ ຊໍາລະເງິນ ແລະກວດສອບສະຖານະຄໍາສັ່ງຊື້ຄົບວົງຈອນ",
        quick: "Quick Links",
        contact: "Contact",
        admin: "Admin Login",
        dev: "Developer Console",
      },
      whyItems: [
        {
          title: "ມີປະກັນຫຼັງການຂາຍ",
          description: "ມີລະບົບປະກັນຊັດເຈນ ດູແລລູກຄ້າຕໍ່ເນື່ອງ",
        },
        {
          title: "ດູແລຕໍ່ເນື່ອງແມ່ນແຕ່ໝົດປະກັນ",
          description: "ຫຼັງໝົດປະກັນຍັງມີທີມງານຄອຍແນະນຳ ແລະຊ່ວຍເຫຼືອ",
        },
        {
          title: "ຈັດສົ່ງເຖິງທີ່ພ້ອມປະກັນຂົນສົ່ງ",
          description: "ຈັດສົ່ງທົ່ວປະເທດ ພ້ອມລະບົບປົກປ້ອງລະຫວ່າງຂົນສົ່ງ",
        },
        {
          title: "ທີ່ປຶກສາສຳລັບຕົວແທນ",
          description: "ຊ່ວຍວາງແຜນການຂາຍ ແລະການດູແລລູກຄ້າຢ່າງເປັນລະບົບ",
        },
      ],
      newsletter: {
        title: "ຮັບຂ່າວສານ ແລະ ໂປຣໂມຊັນຫຼ້າສຸດ",
        subtitle: "ກອກຊື່ ແລະ ອີເມວ ເພື່ອຮັບຂໍ້ສະເໜີພິເສດ ແລະ ການອັບເດດໃໝ່ກ່ອນໃຜ",
        nameLabel: "ຊື່",
        emailLabel: "ອີເມວ",
        namePlaceholder: "ຊື່ຂອງທ່ານ",
        emailPlaceholder: "you@example.com",
        cta: "ສະໝັກຮັບຂ່າວສານ",
        success: "ສະໝັກຮັບຂ່າວສານສຳເລັດແລ້ວ",
        error: "ສະໝັກຮັບຂ່າວສານບໍ່ສຳເລັດ",
      },
    };
  }

  return {
    brand: "Kittisap",
    nav: {
      home: "Home",
      products: "Products",
      pricing: "Pricing",
      promotions: "Promotions + Coupons",
      contact: "Contact",
    },
    cta: {
      products: "Browse Products",
    },
    hero: {
      eyebrow: "KITTISAP CUSTOMER SITE",
      title: "Customer platform connected to the same catalog and orders as admin",
      desc: "Customers can browse products, pricing, promotions, and complete PromptPay checkout in one flow.",
    },
    sections: {
      updates: "Featured Products",
      updatesSub: "",
      news: "Activities and Updates",
      newsSub: "Latest promotions and coupon updates",
    },
    tags: {
      latest: "Live Products",
      updates: "Promotions",
    },
    card: {
      model: "Product",
      meta: "Price • Stock",
      article: "News / Activity Headline",
      articleMeta: "Date • Category",
    },
    footer: {
      title: "Kittisap",
      desc1: "Customer site connected with admin and Supabase.",
      desc2: "Unified flow for browsing, ordering, payment and order tracking.",
      quick: "Quick Links",
      contact: "Contact",
      admin: "Admin Login",
      dev: "Developer Console",
    },
    whyItems: [
      {
        title: "Reliable after-sales support",
        description: "Clear warranty and responsive support team for confident ownership.",
      },
      {
        title: "Continued care after warranty",
        description: "Technical guidance and service assistance even after warranty expires.",
      },
      {
        title: "Nationwide delivery with transport protection",
        description: "Safe delivery process with quality checks and transport coverage.",
      },
      {
        title: "Dealer consultation service",
        description: "Support for partner planning, sales setup, and customer management.",
      },
    ],
    newsletter: {
      title: "Get Latest News and Promotions",
      subtitle: "Enter your name and email to receive exclusive offers and campaign updates.",
      nameLabel: "Name",
      emailLabel: "Email",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@example.com",
      cta: "Subscribe",
      success: "Subscription received successfully.",
      error: "Subscription failed",
    },
  };
}

function Frame({ children, showOuterFrame }: { children: ReactNode; showOuterFrame: boolean }) {
  if (!showOuterFrame) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200">
      {children}
    </main>
  );
}

function WhyChooseUsIconSvg({ icon }: { icon: WhyChooseUsIcon }) {
  if (icon === "shield") {
    return <path d="M12 3l7 3v5c0 4.7-2.9 8.8-7 10-4.1-1.2-7-5.3-7-10V6l7-3zm0 5v7m-3-4h6" />;
  }
  if (icon === "spark") {
    return <path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3zm7 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM5 14l.8 1.8L8 16.6l-2.2.8L5 19l-.8-1.6L2 16.6l2.2-.8L5 14z" />;
  }
  if (icon === "award") {
    return <path d="M12 3a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5s-5-2.2-5-5a5 5 0 0 1 5-5zm0 10v8l-2.5-2-2.5 2v-6.2M12 13l2.5 2 2.5-2v6.2" />;
  }
  if (icon === "layers") {
    return <path d="M12 4l8 4-8 4-8-4 8-4zm-8 8l8 4 8-4M4 16l8 4 8-4" />;
  }
  if (icon === "rocket") {
    return <path d="M14 5c3 .2 4.8 2 5 5-2 2-4 4-6.5 5.5L9 19l.5-3.5C11 13 13 11 15 9c.3-1.6.1-2.8-1-4zM8 16l-3 3m2-8l-2.5.5L4 14l2.5-.5L7 11z" />;
  }
  if (icon === "support") {
    return <path d="M4 12a8 8 0 1 1 16 0v3a2 2 0 0 1-2 2h-2v-5h4M4 12H8v5H6a2 2 0 0 1-2-2v-3zm4 8h8" />;
  }
  if (icon === "speed") {
    return <path d="M4 14a8 8 0 1 1 16 0h-3a5 5 0 1 0-10 0H4zm8-5l4 3-4 3z" />;
  }
  return <path d="M20 7L9 18l-5-5" />;
}

type ShowroomItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  coverUrl: string | null;
  description: string | null;
  images: Array<{ id: string; url: string }>;
};

async function loadShowroomItems(locale: AppLocale): Promise<ShowroomItem[]> {
  try {
    const featuredSource = await listPublicProducts({ featuredOnly: true, page: 1, pageSize: 4 });
    const source = featuredSource.items.length > 0
      ? featuredSource
      : await listPublicProducts({ page: 1, pageSize: 4 });
    return source.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title:
        locale === "en"
          ? item.title_en || item.title_th
          : locale === "lo"
            ? item.title_lo || item.title_en || item.title_th
            : item.title_th,
      price: item.price,
      stock: item.stock,
      coverUrl: item.cover_url,
      description:
        locale === "en"
          ? item.description_en?.trim() || item.description_th?.trim() || null
          : locale === "lo"
            ? item.description_lo?.trim() || item.description_en?.trim() || item.description_th?.trim() || null
            : item.description_th?.trim() || item.description_en?.trim() || null,
      images: item.images,
    }));
  } catch {
    return [];
  }
}

export async function MarketingLandingPage({
  locale,
  useLocalePrefix = false,
  showOuterFrame = true,
  showTopNav = true,
}: MarketingLandingPageProps) {
  const t = copy(locale);
  const showroomItemsPromise = loadShowroomItems(locale);
  let bannerSettings = getDefaultWebBannerSettings();
  let storefrontSettings = getDefaultWebStorefrontSettings();
  let homepageAppearance = getDefaultWebHomepageAppearanceSettings();
  let homepageImageStrip = getDefaultWebHomepageImageStripSettings();
  let homepagePopupSettings = getDefaultWebHomepagePopupSettings();
  let middleBannerSettings = getDefaultWebMiddleBannerSettings();
  let brandGuaranteeSettings = getDefaultWebBrandGuaranteeSettings();
  let newsCardsSettings = getDefaultWebNewsCardsSettings();
  let whyChooseUsSettings = getDefaultWebWhyChooseUsSettings();
  const settingsResults = await Promise.allSettled([
    getWebBannerSettings(),
    getWebStorefrontSettings(),
    getWebHomepageAppearanceSettings(),
    getWebHomepageImageStripSettings(),
    getWebHomepagePopupSettings(),
    getWebWhyChooseUsSettings(),
    getWebMiddleBannerSettings(),
    getWebBrandGuaranteeSettings(),
    getWebNewsCardsSettings(),
  ]);
  const [
    bannerResult,
    storefrontResult,
    homepageAppearanceResult,
    homepageImageStripResult,
    homepagePopupResult,
    whyChooseUsResult,
    middleBannerResult,
    brandGuaranteeResult,
    newsCardsResult,
  ] = settingsResults;
  if (bannerResult.status === "fulfilled") bannerSettings = bannerResult.value;
  if (storefrontResult.status === "fulfilled") storefrontSettings = storefrontResult.value;
  if (homepageAppearanceResult.status === "fulfilled") homepageAppearance = homepageAppearanceResult.value;
  if (homepageImageStripResult.status === "fulfilled") homepageImageStrip = homepageImageStripResult.value;
  if (homepagePopupResult.status === "fulfilled") homepagePopupSettings = homepagePopupResult.value;
  if (whyChooseUsResult.status === "fulfilled") whyChooseUsSettings = whyChooseUsResult.value;
  if (middleBannerResult.status === "fulfilled") middleBannerSettings = middleBannerResult.value;
  if (brandGuaranteeResult.status === "fulfilled") brandGuaranteeSettings = brandGuaranteeResult.value;
  if (newsCardsResult.status === "fulfilled") newsCardsSettings = newsCardsResult.value;
  const showroomItems = await showroomItemsPromise;
  const homePath = withLocale(locale, "/", useLocalePrefix);
  const productsPath = withLocale(locale, "/products", useLocalePrefix);
  const pricingPath = withLocale(locale, "/pricing", useLocalePrefix);
  const contactPath = withLocale(locale, "/contact", useLocalePrefix);
  const localizedHeroEyebrow = localizeSettingText(bannerSettings.eyebrow, locale, t.hero.eyebrow);
  const localizedHeroTitle = localizeSettingText(bannerSettings.title, locale, t.hero.title);
  const localizedHeroDesc = localizeSettingText(bannerSettings.description, locale, t.hero.desc);
  const localizedPrimaryButton = localizeSettingText(bannerSettings.primaryButtonLabel, locale, t.nav.products);
  const localizedSecondaryButton = localizeSettingText(bannerSettings.secondaryButtonLabel, locale, t.nav.contact);
  const localizedCallButtonLabel = localizeSettingText(
    storefrontSettings.callButtonLabel,
    locale,
    locale === "th" ? "โทรหาเรา" : locale === "lo" ? "ໂທຫາພວກເຮົາ" : "Call Us",
  );
  const localizedFooterTitle = localizeSettingText(storefrontSettings.footerTitle, locale, t.footer.title);
  const localizedFooterDesc1 = localizeSettingText(storefrontSettings.footerDescription1, locale, t.footer.desc1);
  const localizedFooterDesc2 = localizeSettingText(storefrontSettings.footerDescription2, locale, t.footer.desc2);
  const localizedFooterContactTitle = localizeSettingText(storefrontSettings.footerContactTitle, locale, t.footer.contact);
  const localizedFooterCallLabel = localizeSettingText(
    storefrontSettings.footerCallLabel,
    locale,
    locale === "th" ? "โทร" : locale === "lo" ? "ໂທ" : "Call",
  );
  const localizedFooterLineLabel = localizeSettingText(
    storefrontSettings.footerLineLabel,
    locale,
    locale === "th" ? "ไลน์" : locale === "lo" ? "LINE" : "LINE",
  );
  const localizedFooterFacebookLabel = localizeSettingText(
    storefrontSettings.footerFacebookLabel,
    locale,
    locale === "th" ? "เฟซบุ๊ก" : locale === "lo" ? "Facebook" : "Facebook",
  );
  const localizedIntroTitle = localizeSettingText(
    homepageAppearance.introTitle,
    locale,
    locale === "en" ? "KITTISAP ATV" : locale === "lo" ? "KITTISAP ATV" : homepageAppearance.introTitle,
  );
  const localizedIntroContent = localizeSettingText(homepageAppearance.introContent, locale, t.hero.desc);
  const localizedBrandTitle = localizeSettingText(
    brandGuaranteeSettings.sectionTitle,
    locale,
    locale === "en" ? "Trusted Brands and Standards" : locale === "lo" ? "ແບຣນ ແລະ ມາດຕະຖານທີ່ໄວ້ວາງໃຈ" : brandGuaranteeSettings.sectionTitle,
  );
  const localizedBrandSubtitle = localizeSettingText(
    brandGuaranteeSettings.sectionSubtitle,
    locale,
    locale === "en"
      ? "Partners and standards trusted by our customers"
      : locale === "lo"
        ? "ພາກສ່ວນຮ່ວມ ແລະ ມາດຕະຖານທີ່ລູກຄ້າໄວ້ວາງໃຈ"
        : brandGuaranteeSettings.sectionSubtitle,
  );
  const localizedWhyTitle = localizeSettingText(
    whyChooseUsSettings.sectionTitle,
    locale,
    locale === "en" ? "Why Choose KITTISAP ATV" : locale === "lo" ? "ເປັນຫຍັງຕ້ອງເລືອກ KITTISAP ATV" : whyChooseUsSettings.sectionTitle,
  );
  const localizedWhySubtitle = localizeSettingText(
    whyChooseUsSettings.sectionSubtitle,
    locale,
    locale === "en"
      ? "Built for riders and businesses that need confidence"
      : locale === "lo"
        ? "ອອກແບບສຳລັບຜູ້ໃຊ້ ແລະ ທຸລະກິດທີ່ຕ້ອງການຄວາມໜ້າເຊື່ອຖື"
        : whyChooseUsSettings.sectionSubtitle,
  );
  const localizedWhyTagline = localizeSettingText(
    whyChooseUsSettings.sectionTagline,
    locale,
    locale === "en"
      ? "Performance, support and reliability in one place"
      : locale === "lo"
        ? "ສົມທົບປະສິດທິພາບ ການບໍລິການ ແລະ ຄວາມໄວ້ວາງໃຈ"
        : whyChooseUsSettings.sectionTagline,
  );
  // Build a full-screen slideshow from Supabase product image galleries.
  // The old promotional banner is deliberately excluded because it contains
  // large words baked into the pixels. No images are copied into source code.
  const heroSlides = showroomItems.flatMap((item) => {
    const gallery = item.images.length > 0
      ? item.images
      : item.coverUrl ? [{ id: item.id, url: item.coverUrl }] : [];
    return gallery.map((image) => ({
      id: `${item.id}-${image.id}`,
      src: image.url,
      title: item.title,
      productHref: withLocale(locale, `/products/${item.slug}`, useLocalePrefix),
    }));
  }).filter((slide, index, all) => all.findIndex((x) => x.src === slide.src) === index).slice(0, 10);
  const origin = "https://kittisap-admin.vercel.app";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: storefrontSettings.brandName || "KITTISAP ATV",
        url: origin,
        inLanguage: locale === "th" ? "th-TH" : locale === "lo" ? "lo-LA" : "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: storefrontSettings.brandName || "KITTISAP ATV",
        url: origin,
        ...(storefrontSettings.storefrontLogoUrl
          ? { logo: storefrontSettings.storefrontLogoUrl }
          : {}),
        contactPoint: [{
          "@type": "ContactPoint",
          telephone: storefrontSettings.callPhone || undefined,
          contactType: "customer service",
        }],
      },
      {
        "@type": "ItemList",
        name: locale === "th" ? "รถ ATV แนะนำ" : "Featured ATV models",
        itemListElement: showroomItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${origin}${withLocale(locale, `/products/${item.slug}`, useLocalePrefix)}`,
          item: {
            "@type": "Product",
            name: item.title,
            url: `${origin}${withLocale(locale, `/products/${item.slug}`, useLocalePrefix)}`,
            ...(item.coverUrl ? { image: [item.coverUrl] } : {}),
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "THB",
              availability: item.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          },
        })),
      },
    ],
  };
  return (
    <Frame showOuterFrame={showOuterFrame}>
      <div
        className="kittisap-premium-home"
        style={{
          backgroundColor: homepageAppearance.pageBackgroundColor,
          color: homepageAppearance.textColor,
        }}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <StorefrontRealtimeRefresh />
        <HomepagePromoPopup locale={locale} settings={homepagePopupSettings} />
        {showTopNav ? (
          <MarketingTopNav
            locale={locale}
            useLocalePrefix={useLocalePrefix}
            brand={storefrontSettings.brandName || t.brand}
            logoUrl={storefrontSettings.storefrontLogoUrl}
            nav={t.nav}
            cta={{
              ...t.cta,
              call: localizedCallButtonLabel,
              phone: storefrontSettings.callPhone || "+66843374982",
            }}
          />
        ) : null}

      <PremiumHomeHero
        settings={bannerSettings}
        locale={locale}
        slides={heroSlides}
        eyebrow={localizedHeroEyebrow}
        title={localizedHeroTitle}
        description={localizedHeroDesc}
        primaryLabel={localizedPrimaryButton}
        secondaryLabel={localizedSecondaryButton}
        productsHref={productsPath}
        contactHref={contactPath}
      />

      <section
        className="mx-auto w-full max-w-[1680px] px-4"
        style={{ marginTop: `${homepageAppearance.sectionGapPx}px` }}
      >
        <article
          className="premium-intro relative overflow-hidden rounded-[28px] border border-[#c5a467]/20 px-6 py-10 text-center shadow-2xl md:px-12 md:py-14"
          style={{ backgroundColor: homepageAppearance.introCardBackgroundColor }}
        >
          <h2
            className="tracking-tight"
            style={{
              color: homepageAppearance.introTitleColor,
              fontWeight: homepageAppearance.introTitleFontWeight,
              fontSize: `clamp(28px, 3.2vw, ${homepageAppearance.introTitleFontSizePx}px)`,
              textShadow: homepageAppearance.introTextGlow ? "0 0 18px rgba(218, 170, 84, 0.28)" : "none",
            }}
          >
            {localizedIntroTitle}
          </h2>
          <p
            className="mx-auto mt-4 max-w-5xl whitespace-pre-line leading-8"
            style={{
              color: homepageAppearance.introContentColor,
              fontWeight: homepageAppearance.introContentFontWeight,
              fontSize: `clamp(16px, 1.8vw, ${homepageAppearance.introContentFontSizePx}px)`,
              textShadow: homepageAppearance.introTextGlow ? "0 0 14px rgba(218, 170, 84, 0.22)" : "none",
            }}
          >
            {localizedIntroContent}
          </p>
        </article>
      </section>

      {homepageImageStrip.items.length > 0 ? (
        <section
          className="mx-auto w-full max-w-[1680px] px-4"
          style={{ marginTop: `${homepageImageStrip.sectionGapPx}px` }}
        >
          <div
            className={`grid gap-4 ${
              homepageImageStrip.items.length >= 4
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {homepageImageStrip.items.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="premium-image-tile group overflow-hidden rounded-2xl border border-[#d4aa5c]/25 bg-[#141210] shadow-2xl"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={item.imageUrl}
                    alt={item.altText || "Homepage image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <FeaturedProductsLiveSection
        initialItems={showroomItems}
        locale={locale}
        useLocalePrefix={useLocalePrefix}
        sectionTitle={t.sections.updates}
        sectionSubtitle={t.sections.updatesSub}
        liveTagLabel={t.tags.latest}
      />

      <MiddleBannerStrip
        items={middleBannerSettings.items}
        backgroundColor={middleBannerSettings.backgroundColor}
        sectionGapRem={middleBannerSettings.sectionGapRem}
      />

      {brandGuaranteeSettings.items.length > 0 ? (
        <section
          className="mx-auto w-full max-w-[1680px] px-4"
          style={{ marginTop: `${brandGuaranteeSettings.sectionGapPx}px` }}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-100 md:text-3xl">{localizedBrandTitle}</h2>
            {localizedBrandSubtitle ? (
              <p className="mt-1 text-sm text-slate-300/70">{localizedBrandSubtitle}</p>
            ) : null}
          </div>

          <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
            <div
              className={`flex min-w-max gap-4 ${
                brandGuaranteeSettings.align === "left"
                  ? "justify-start"
                  : brandGuaranteeSettings.align === "right"
                    ? "justify-end"
                    : "justify-center"
              }`}
            >
              {brandGuaranteeSettings.items.map((item) => {
                const effectClass =
                  brandGuaranteeSettings.effect === "lift"
                    ? "hover:-translate-y-1 hover:shadow-xl"
                    : brandGuaranteeSettings.effect === "glow"
                      ? "hover:shadow-[0_0_30px_rgba(220,172,77,0.45)]"
                      : brandGuaranteeSettings.effect === "pulse"
                        ? "hover:scale-[1.04]"
                        : "";
                const card = (
                  <article className={`premium-brand-card rounded-2xl border border-[#d3ac65]/30 bg-[#f5f0e5] p-4 transition ${effectClass}`}>
                    <div className="relative h-[90px] w-[150px]">
                      <Image src={item.logoUrl} alt={item.altText || ""} fill className="object-contain" loading="lazy" unoptimized />
                    </div>
                  </article>
                );
                return item.linkUrl ? (
                  <a key={item.id} href={item.linkUrl} target="_blank" rel="noreferrer" className="inline-block">
                    {card}
                  </a>
                ) : (
                  <div key={item.id} className="inline-block">
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {whyChooseUsSettings.items.length > 0 ? (
        <section
          className="mx-auto w-full max-w-[1680px] px-4"
          style={{ marginTop: `${whyChooseUsSettings.sectionGapPx}px` }}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-100 md:text-4xl">{localizedWhyTitle}</h2>
              {localizedWhySubtitle ? (
                <p className="mt-1 text-sm text-slate-300/75">{localizedWhySubtitle}</p>
              ) : null}
            </div>
            {localizedWhyTagline ? (
              <p className="text-sm text-slate-300/70">{localizedWhyTagline}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {whyChooseUsSettings.items.slice(0, 6).map((item, index) => {
              const fallbackItem = t.whyItems[index] ?? t.whyItems[t.whyItems.length - 1];
              const localizedWhyItemTitle = localizeSettingText(item.title, locale, fallbackItem.title);
              const localizedWhyItemDescription = localizeSettingText(
                item.description,
                locale,
                fallbackItem.description,
              );

              return (
              <article key={item.id} className="premium-benefit-card rounded-2xl border border-[#d4af63]/20 bg-[#141414]/90 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.26)]">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-[#3b2b17] text-[#edc36e]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                    <WhyChooseUsIconSvg icon={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-100">{localizedWhyItemTitle}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300/85">{localizedWhyItemDescription}</p>
              </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section id="news" className="mx-auto w-full max-w-[1680px] px-4 py-12" style={{ marginTop: `${newsCardsSettings.sectionGapPx}px` }}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100 md:text-3xl">{t.sections.news}</h2>
            <p className="mt-1 text-sm text-slate-300/70">{t.sections.newsSub}</p>
          </div>
          <span className="rounded-full border border-slate-400/20 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-200/85">{t.tags.updates}</span>
        </div>
        <ActivitiesNewsGrid items={newsCardsSettings.items} placeholderTitle={t.card.article} placeholderMeta={t.card.articleMeta} />
      </section>

      <NewsletterSubscribeSection
        title={t.newsletter.title}
        subtitle={t.newsletter.subtitle}
        nameLabel={t.newsletter.nameLabel}
        emailLabel={t.newsletter.emailLabel}
        namePlaceholder={t.newsletter.namePlaceholder}
        emailPlaceholder={t.newsletter.emailPlaceholder}
        ctaLabel={t.newsletter.cta}
        successMessage={t.newsletter.success}
        errorMessage={t.newsletter.error}
      />

      <footer
        id="contact"
        className="premium-footer border-t border-[#d6aa59]/25 py-12 text-slate-300/85"
        style={{ color: homepageAppearance.textColor }}
      >
        <div className="mx-auto grid w-full max-w-[1680px] gap-10 px-6 md:grid-cols-[1.2fr_0.7fr_0.7fr] xl:px-10">
          <div>
            <p className="text-base font-black text-slate-100">{localizedFooterTitle}</p>
            <p className="mt-2 text-sm text-slate-300/75">{localizedFooterDesc1}</p>
            <p className="text-sm text-slate-300/75">{localizedFooterDesc2}</p>
          </div>

          <div>
            <p className="text-base font-black text-slate-100">{t.footer.quick}</p>
            <div className="mt-2 space-y-1 text-sm">
              <Link href={homePath} className="block hover:text-amber-200">{t.nav.home}</Link>
              <Link href={productsPath} className="block hover:text-amber-200">{t.nav.products}</Link>
              <Link href={pricingPath} className="block hover:text-amber-200">{t.nav.pricing}</Link>
              <Link href={contactPath} className="block hover:text-amber-200">{t.nav.contact}</Link>
            </div>
          </div>

          <div>
            <p className="text-base font-black text-slate-100">{localizedFooterContactTitle}</p>
            <div className="mt-2 space-y-1 text-sm">
              <a href={`tel:${storefrontSettings.callPhone || "+66843374982"}`} className="block hover:text-amber-200">
                {localizedFooterCallLabel}
              </a>
              <a href={storefrontSettings.lineUrl || "https://line.me"} className="block hover:text-amber-200">
                {localizedFooterLineLabel}
              </a>
              <a href={storefrontSettings.facebookUrl || "https://facebook.com"} className="block hover:text-amber-200">
                {localizedFooterFacebookLabel}
              </a>
            </div>
          </div>
        </div>

        <div
          className="mx-auto mt-10 w-full max-w-[1680px] border-t border-[#d5aa5c]/25 px-6 pt-6 text-xs xl:px-10"
          style={{
            backgroundColor: homepageAppearance.footerBottomBackgroundColor,
            color: homepageAppearance.textColor,
          }}
        >
          © {new Date().getFullYear()} {localizedFooterTitle}
          <span className="mx-2">|</span>
          <Link href="/login" className="hover:text-amber-200">{t.footer.admin}</Link>

        </div>
      </footer>
      </div>
    </Frame>
  );
}

