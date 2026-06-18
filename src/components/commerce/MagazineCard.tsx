import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import type { ProductListItem } from "@/types/product";
import type { FeedAugment } from "@/app/(commerce)/home/mock";

interface MagazineCardProps {
  product: ProductListItem;
  augment: FeedAugment;
}

export function MagazineCard({ product, augment }: MagazineCardProps) {
  const hasImage = !!product.image_url;
  const n = product.nutrition;

  // 영양 5열 테이블 — 상품 영양정보 4값 + 보강된 식이섬유
  const nutritionCells = n
    ? [
        { label: "칼로리", value: `${n.calories}` },
        { label: "단백질", value: `${n.protein}g` },
        { label: "당류", value: `${n.sugar}g` },
        { label: "지방", value: `${n.fat}g` },
        { label: "식이섬유", value: `${augment.fiber}g` },
      ]
    : [];

  const { insight } = augment;

  return (
    <article className="flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        {/* 이미지 */}
        <div className="aspect-square bg-[#f5f5f5] rounded-[10px] relative flex items-center justify-center overflow-hidden">
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

        {/* 카테고리 배지 + 상품명 */}
        <div className="mt-4">
          <Badge>{augment.concern.label}</Badge>
        </div>
        <h3 className="mt-2.5 text-[18px] leading-snug text-black line-clamp-2">
          {product.name}
        </h3>

        {/* 영양정보 5열 테이블 */}
        {nutritionCells.length > 0 && (
          <div className="mt-4 grid grid-cols-5 rounded-[10px] border border-[#e0e0e0] divide-x divide-[#e0e0e0]">
            {nutritionCells.map((cell) => (
              <div key={cell.label} className="flex flex-col items-center gap-1 py-3">
                <span className="text-[11px] text-[#888]">{cell.label}</span>
                <span className="text-[13px] text-black font-medium">{cell.value}</span>
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* 두들 인사이트 */}
      <div className="mt-5 rounded-[10px] bg-[#f5f5f5] p-5">
        <p className="text-[13px] font-medium text-black">두들 인사이트</p>
        <p className="mt-2.5 text-[13px] leading-relaxed text-[#666]">{insight.body}</p>
        <p className="mt-3 text-[12px] text-[#aaa]">
          by {insight.role} {insight.author}
        </p>
      </div>
    </article>
  );
}
