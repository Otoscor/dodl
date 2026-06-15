import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

interface MyProductRowProps {
  product: ProductListItem;
}

export function MyProductRow({ product }: MyProductRowProps) {
  const hasImage = product.image_url?.startsWith("http");
  const hasRange = product.min_price !== product.max_price;

  return (
    <Link href={`/products/${product.id}`} className="flex items-center gap-4 px-6 py-4 active:bg-[#f5f5f5] transition-colors">
      {/* 썸네일 */}
      <div className="w-[72px] h-[72px] rounded-[10px] bg-[#f5f5f5] shrink-0 relative overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="72px"
          />
        ) : (
          <span className="material-icons-outlined text-[28px] text-[#e0e0e0]">medication</span>
        )}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#aaa] uppercase tracking-[0.08em] mb-0.5">
          {product.category_name}
        </p>
        <p className="text-[15px] text-black leading-snug line-clamp-2 mb-1">
          {product.name}
        </p>
        <p className="font-mono text-[16px] text-black font-bold">
          {product.all_sold_out
            ? "품절"
            : hasRange
            ? `${formatPrice(product.min_price)} ~`
            : formatPrice(product.min_price)}
        </p>
      </div>
    </Link>
  );
}
