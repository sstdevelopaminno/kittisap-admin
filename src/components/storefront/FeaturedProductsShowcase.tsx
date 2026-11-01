"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { AppLocale } from "../../../lib/i18n/locale";
import { StorefrontProductQuickViewModal, type StorefrontQuickViewItem } from "./StorefrontProductQuickViewModal";

type ShowroomItem = StorefrontQuickViewItem;

function labels(locale: AppLocale) {
  if (locale === "th") {
    return {
      close: "ปิด",
      detail: "ดูรายละเอียดสินค้า",
      orderNow: "สั่งซื้อเลย",
      addToCart: "ใส่ตะกร้า",
      goToCart: "ไปตะกร้า",
      outOfStock: "สินค้าหมด",
      stock: "สต็อก",
      noImage: "ไม่มีรูปภาพ",
      featured: "สินค้าแนะนำ",
    };
  }

  if (locale === "lo") {
    return {
      close: "ປິດ",
      detail: "ເບິ່ງລາຍລະອຽດສິນຄ້າ",
      orderNow: "ສັ່ງຊື້ທັນທີ",
      addToCart: "ໃສ່ກະຕ່າ",
      goToCart: "ໄປກະຕ່າ",
      outOfStock: "ສິນຄ້າໝົດ",
      stock: "ສະຕັອກ",
      noImage: "ບໍ່ມີຮູບ",
      featured: "ສິນຄ້າແນະນຳ",
    };
  }

  return {
    close: "Close",
    detail: "View product details",
    orderNow: "Order now",
    addToCart: "Add to cart",
    goToCart: "Go to cart",
    outOfStock: "Out of stock",
    stock: "Stock",
    noImage: "No image",
    featured: "Featured Product",
  };
}

export function FeaturedProductsShowcase({
  items,
  locale,
  useLocalePrefix,
}: {
  items: ShowroomItem[];
  locale: AppLocale;
  useLocalePrefix: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeItem = useMemo(() => items.find((item) => item.id === activeId) ?? null, [activeId, items]);
  const t = labels(locale);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className="group tap-ripple app-press relative overflow-hidden rounded-[24px] border border-[#d4ae64]/20 bg-[#141414] text-left shadow-[0_18px_60px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:border-[#d4ae64]/70 hover:shadow-[0_22px_65px_rgba(170,116,36,0.14)]"
          >
            {item.coverUrl ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f6f2]">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.08]"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(20,20,20,1))] text-sm text-amber-100">
                {t.noImage}
              </div>
            )}
            <div className="space-y-3 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7b16a]">KITTISAP ATV</p>
              <h3 className="line-clamp-2 min-h-[3.2rem] text-base font-extrabold leading-relaxed tracking-tight text-[#f8f1e5]">{item.title}</h3>
              <div className="flex items-center justify-between gap-2 border-t border-[#d4ae64]/20 pt-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-400">{locale === "th" ? "ราคาเริ่มต้น" : locale === "lo" ? "ລາຄາ" : "Price"}</span>
                  <span className="text-lg font-black text-[#f3ce80]">฿{item.price.toLocaleString()}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.stock > 0 ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>
                  {item.stock > 0 ? `${t.stock} ${item.stock}` : t.outOfStock}
                </span>
              </div>
              <p className="inline-flex items-center gap-2 text-xs font-bold text-amber-100/90 transition group-hover:text-[#f2ca78]">
                {t.detail} <span aria-hidden="true">↗</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {activeItem ? (
        <StorefrontProductQuickViewModal
          open
          item={activeItem}
          locale={locale}
          useLocalePrefix={useLocalePrefix}
          eyebrow={t.featured}
          text={{
            close: t.close,
            noImage: t.noImage,
            stock: t.stock,
            outOfStockLabel: t.outOfStock,
            addToCart: t.addToCart,
            goToCart: t.goToCart,
            orderNow: t.orderNow,
            viewDetails: t.detail,
          }}
          onClose={() => setActiveId(null)}
        />
      ) : null}
    </>
  );
}
