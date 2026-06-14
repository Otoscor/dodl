import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

// Inter Variable — next/font/google의 Inter는 Variable 폰트로 제공됨
// weight range 100-900, 소수점 굵기(510, 590)는 Variable 축으로 지원
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dodl — 건강을 더하다",
  description: "건기식 미니 커머스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="h-full">
        <ToastProvider>
          <div className="mx-auto max-w-[430px] min-h-full bg-surface-base relative">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
