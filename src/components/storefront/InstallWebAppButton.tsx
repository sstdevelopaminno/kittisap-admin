"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallWebAppButton({ locale }: { locale: "th" | "en" | "lo" }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    const onInstallable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installPrompt) return null;

  const label = locale === "th" ? "ติดตั้งแอป" : locale === "lo" ? "ຕິດຕັ້ງແອັບ" : "Install App";
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#d7b36d]/45 bg-white/5 px-3 text-xs font-bold text-[#f5d38b] transition hover:bg-[#d7b36d]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5d38b]"
      onClick={async () => {
        try {
          await installPrompt.prompt();
          await installPrompt.userChoice;
        } finally {
          setInstallPrompt(null);
        }
      }}
      aria-label={label}
    >
      <span aria-hidden="true">＋</span><span className="hidden sm:inline">{label}</span>
    </button>
  );
}
