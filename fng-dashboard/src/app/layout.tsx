import type { Metadata } from "next";
import { Press_Start_2P, Diphylleia } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-context";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro",
});

const diphylleia = Diphylleia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-korean",
});

export const metadata: Metadata = {
  title: "Crypto Fear & Greed Index | 가상자산 공포 탐욕 지수",
  description:
    "실시간 가상자산 시장 심리 지표 커뮤니티. Fear & Greed Index를 통해 시장 심리를 파악하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${pressStart2P.variable} ${diphylleia.variable} antialiased`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
