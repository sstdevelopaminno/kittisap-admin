import type { Metadata } from "next";

import type { AppLocale } from "../i18n/locale";
import { listPublicProducts } from "../db/publicProducts";

const SITE = "https://kittisap-admin.vercel.app";

const seoCopy: Record<AppLocale, { title: string; description: string; keywords: string[] }> = {
  th: {
    title: "KITTISAP ATV | รถ ATV และรถออฟโรด เลือกชมรุ่น ราคา และสั่งซื้อ",
    description: "เลือกชมรถ ATV และรถออฟโรดจาก KITTISAP ATV ดูข้อมูลสินค้า ราคา สต็อก โปรโมชัน และติดต่อทีมงานเพื่อสั่งซื้อได้ผ่านเว็บไซต์",
    keywords: ["KITTISAP ATV", "รถ ATV", "รถเอทีวี", "รถออฟโรด", "ราคา ATV", "รถ ATV ประเทศไทย"],
  },
  en: {
    title: "KITTISAP ATV | ATV & Off-Road Vehicles in Thailand",
    description: "Discover ATV and off-road vehicles from KITTISAP ATV. Browse models, live product details, prices, promotions, and contact our team online.",
    keywords: ["KITTISAP ATV", "ATV Thailand", "off-road vehicles", "ATV models", "ATV prices"],
  },
  lo: {
    title: "KITTISAP ATV | ລົດ ATV ແລະ ລົດອອບໂຣດ",
    description: "ເບິ່ງສິນຄ້າລົດ ATV ແລະ ລົດອອບໂຣດຈາກ KITTISAP ATV ພ້ອມຂໍ້ມູນລາຄາ ແລະ ຕິດຕໍ່ສັ່ງຊື້.",
    keywords: ["KITTISAP ATV", "ລົດ ATV", "ລົດອອບໂຣດ"],
  },
};

export async function getHomeMetadata(locale: AppLocale): Promise<Metadata> {
  const copy = seoCopy[locale];
  const canonical = locale === "th" ? SITE : `${SITE}/${locale}`;
  let heroImage: string | null = null;
  try {
    const featured = await listPublicProducts({ featuredOnly: true, includeTotal: false, page: 1, pageSize: 4 });
    const items = featured.items.length
      ? featured.items
      : (await listPublicProducts({ includeTotal: false, page: 1, pageSize: 4 })).items;
    heroImage = items.find((item) => Boolean(item.cover_url))?.cover_url ?? null;
  } catch {
    // Keep metadata usable even during transient database outages.
  }

  const images = heroImage?.startsWith("https://")
    ? [{ url: heroImage, alt: "KITTISAP ATV models and showroom" }]
    : [{ url: `${SITE}/icons/pwa-icon-512.png`, alt: "KITTISAP ATV" }];

  return {
    title: { absolute: copy.title },
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical,
      languages: {
        "th-TH": SITE,
        "en-US": `${SITE}/en`,
        "lo-LA": `${SITE}/lo`,
        "x-default": SITE,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      type: "website",
      siteName: "KITTISAP ATV",
      locale: locale === "th" ? "th_TH" : locale === "lo" ? "lo_LA" : "en_US",
      images,
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: images.map((item) => item.url) },
    robots: { index: true, follow: true },
  };
}
