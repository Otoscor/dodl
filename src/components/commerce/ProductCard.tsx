import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasRange = product.min_price !== product.max_price;

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden transition-colors hover:border-text-quaternary">
        {/* Image placeholder */}
        <div className="aspect-square bg-surface-base relative flex items-center justify-center">
          <span className="text-4xl">💊</span>
          {product.all_sold_out && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="red">품절</Badge>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3 space-y-1.5">
          <p className="text-[11px] text-text-tertiary">{product.category_name}</p>
          <h3 className="text-[14px] text-text-primary font-medium leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1">
            {product.all_sold_out ? (
              <span className="text-[13px] text-text-quaternary">품절</span>
            ) : hasRange ? (
              <span className="font-mono text-[14px] text-text-primary font-medium">
                {formatPrice(product.min_price)} ~
              </span>
            ) : (
              <span className="font-mono text-[14px] text-text-primary font-medium">
                {formatPrice(product.min_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
