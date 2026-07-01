import "./proto.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * 프로토타입 격리 레이아웃.
 * - globals.css의 흑백 토큰·monospace·자간 상속을 .proto-root 스코프로 차단
 * - 커머스 chrome(CartProvider·BottomTabBar) 미적용 — 독립 플로우
 * - 430px 클램프 없음 → Figma 프레임 폭 그대로 (각 프로토가 자체 폭 지정)
 */
export default function ProtoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${inter.variable} proto-root min-h-screen`}>{children}</div>;
}
