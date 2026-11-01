"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { WebHomepageImageItem } from "../../../lib/types/web-settings";

type MiddleBannerStripProps = {
  items: WebHomepageImageItem[];
  backgroundColor: string;
  sectionGapRem: number;
};

export function MiddleBannerStrip({ items, backgroundColor, sectionGapRem }: MiddleBannerStripProps) {
  const [brokenIds, setBrokenIds] = useState<string[]>([]);

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => item.imageUrl.trim().length > 0)
        .filter((item) => !brokenIds.includes(item.id))
        .slice(0, 3),
    [items, brokenIds],
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 xl:px-10"
      style={{ marginTop: `${sectionGapRem}rem` }}
    >
      <div
        className="space-y-6 overflow-hidden rounded-[28px] border border-[#d3a85e]/25 p-2 sm:p-3"
        style={{ backgroundColor }}
      >
        {visibleItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d3a85e]/25 bg-[#08090b]">
            <div className="relative aspect-[16/8] w-full sm:aspect-[21/8]">
              <Image
                src={item.imageUrl}
                alt="Kittisap ATV promotional banner"
                fill
                sizes="100vw"
                className="object-contain"
                loading="lazy"
                unoptimized
                onError={() => {
                  setBrokenIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
