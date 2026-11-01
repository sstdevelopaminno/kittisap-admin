import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { normalizeAdminLocale } from "../../lib/i18n/admin";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#100e0a", colorScheme: "dark", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL("https://kittisap-admin.vercel.app"),
  title: {
    default: "KITTISAP ATV | รถ ATV และรถออฟโรด",
    template: "%s | KITTISAP ATV",
  },
  description: "KITTISAP ATV — เลือกชมรถ ATV รถออฟโรด ราคา สินค้าและโปรโมชัน พร้อมระบบสั่งซื้อและบริการลูกค้า",
  manifest: "/manifest.webmanifest?v=20261101",
  applicationName: "KITTISAP ATV",
  appleWebApp: { capable: true, title: "KITTISAP ATV", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/icons/pwa-icon-512.png",
    shortcut: "/icons/pwa-icon-512.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = normalizeAdminLocale(cookieStore.get("admin_locale")?.value);

  return (
    <html lang={locale}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

