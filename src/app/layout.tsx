import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "dodl — 건강을 더하다",
  description: "건기식 미니 커머스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f5f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="min-h-full">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#f5f5f5]">
        <ToastProvider>
          <div className="mx-auto max-w-[430px] min-h-full bg-surface-base relative ">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
