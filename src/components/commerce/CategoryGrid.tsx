import Link from "next/link";
import type { Category } from "@/types/product";

interface CategoryGridProps {
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, string> = {
  vitamin: "medication",
  probiotics: "biotech",
  omega3: "water_drop",
  mineral: "science",
  collagen: "spa",
  kids: "child_care",
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-[1px] bg-[#e0e0e0] mx-6 rounded-[10px] overflow-hidden border border-[#e0e0e0]">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="flex flex-col items-center gap-3 py-8 bg-white"
        >
          <span className="material-icons-outlined text-[24px] text-[#888]">
            {CATEGORY_ICONS[category.slug] || "inventory_2"}
          </span>
          <span className="text-[12px] text-black uppercase tracking-[0.12em]">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
