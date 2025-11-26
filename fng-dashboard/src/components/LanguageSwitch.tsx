"use client";

import { useI18n } from "@/lib/i18n-context";
import { Locale } from "@/lib/i18n";

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleChange("ko")}
        className={`w-8 h-6 rounded border-2 transition-all flex items-center justify-center text-sm ${
          locale === "ko"
            ? "border-[#8b0000] bg-[#8b0000]/20 shadow-[0_0_8px_#8b000060]"
            : "border-[#3d2d1f] hover:border-[#8b0000]/50 opacity-50 hover:opacity-100"
        }`}
        title="한국어"
      >
        🇰🇷
      </button>
      <button
        onClick={() => handleChange("en")}
        className={`w-8 h-6 rounded border-2 transition-all flex items-center justify-center text-sm ${
          locale === "en"
            ? "border-[#8b0000] bg-[#8b0000]/20 shadow-[0_0_8px_#8b000060]"
            : "border-[#3d2d1f] hover:border-[#8b0000]/50 opacity-50 hover:opacity-100"
        }`}
        title="English"
      >
        🇺🇸
      </button>
    </div>
  );
}
