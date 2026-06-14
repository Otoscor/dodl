import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { CartProvider } from "@/hooks/useCart";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <main className="pb-20">{children}</main>
      <BottomTabBar />
    </CartProvider>
  );
}
