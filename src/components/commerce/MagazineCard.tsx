import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import type { ProductListItem } from "@/types/product";

interface MagazineCardProps {
  product: ProductListItem;
}

export function MagazineCard({ product }: MagazineCardProps) {
  const hasImage = product.image_url && product.image_url.startsWith("http");
  const n = product.nutrition;

  const nutritionItems = n
    ? [
        { label: "칼로리", value: `${n.calories}Kcal` },
        { label: "단백질", value: `${n.protein}g` },
        { label: "당류", value: `${n.sugar}g` },
        { label: "지방", value: `${n.fat}g` },
      ]
    : [];

  return (
    <Link href={`/products/${product.id}`} className="block">
      {/* 이미지 */}
      <div className="aspect-[4/3] bg-[#f5f5f5] rounded-[10px] relative flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 430px) 100vw, 430px"
          />
        ) : (
          <span className="material-icons-outlined text-[48px] text-[#e0e0e0]">medication</span>
        )}
        {product.all_sold_out && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Badge variant="red">품절</Badge>
          </div>
        )}
      </div>

      {/* 브랜드 + 상품명 */}
      <p className="mt-4 text-[12px] text-[#aaa]">{product.brand}</p>
      <h3 className="mt-1.5 text-[18px] leading-snug text-black line-clamp-2">
        {product.name}
      </h3>

      {/* 영양정보 */}
      {nutritionItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#e0e0e0] flex gap-x-5 gap-y-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {nutritionItems.map((item) => (
            <div key={item.label} className="shrink-0 text-[13px] whitespace-nowrap">
              <span className="text-[#888]">{item.label} </span>
              <span className="text-black font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
