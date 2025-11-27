import type { Metadata } from "next";
import { Press_Start_2P, Black_And_White_Picture } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-context";
import { AuthProvider } from "@/lib/auth-context";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro",
});

const blackAndWhitePicture = Black_And_White_Picture({
  weight: "400",
  subsets: ["latin", "korean"],
  variable: "--font-korean",
});

export const metadata: Metadata = {
  title: "Fear & Greed Community | 공포 탐욕 커뮤니티",
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
      <body className={`${pressStart2P.variable} ${blackAndWhitePicture.variable} antialiased`}>
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
