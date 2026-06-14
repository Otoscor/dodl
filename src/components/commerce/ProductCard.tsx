import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasRange = product.min_price !== product.max_price;
  const hasImage = product.image_url && product.image_url.startsWith("http");

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="group">
        {/* Image */}
        <div className="aspect-[3/4] bg-[#f5f5f5] rounded-[10px] relative flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 430px) 50vw, 200px"
            />
          ) : (
            <span className="material-icons-outlined text-[40px] text-[#e0e0e0]">medication</span>
          )}
          {product.all_sold_out && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="red">품절</Badge>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="pt-4 pb-8 space-y-1.5">
          <p className="text-[12px] text-[#aaa] uppercase tracking-[0.1em]">{product.category_name}</p>
          <h3 className="text-[16px] text-black leading-snug line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1">
            {product.all_sold_out ? (
              <span className="text-[13px] text-[#cccccc]">품절</span>
            ) : hasRange ? (
              <span className="font-mono text-[16px] text-[#888] tracking-[0.02em]">
                {formatPrice(product.min_price)} ~
              </span>
            ) : (
              <span className="font-mono text-[16px] text-[#888] tracking-[0.02em]">
                {formatPrice(product.min_price)}
              </span>
            )}
          </div>
          {product.key_specs?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.key_specs.slice(0, 3).map((spec) => (
                <span key={spec} className="text-[12px] text-[#888] bg-[#f5f5f5] rounded-[6px] px-1.5 py-0.5">
                  {spec}
                </span>
              ))}
            </div>
          )}
          {product.review_count > 0 && (
            <p className="text-[13px] text-[#aaa]">
              ★ {product.average_rating} ({product.review_count})
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
