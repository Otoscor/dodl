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
        <div className="mx-auto max-w-[430px] min-h-full bg-surface-base relative">
          <main className="pb-20">{children}</main>
          <BottomTabBar />
        </div>
      </AddressProvider>
    </CartProvider>
  );
}
