import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { CartProvider } from "@/hooks/useCart";
import { AddressProvider } from "@/hooks/useAddresses";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <AddressProvider>
        <main className="pb-20">{children}</main>
        <BottomTabBar />
      </AddressProvider>
    </CartProvider>
  );
}
