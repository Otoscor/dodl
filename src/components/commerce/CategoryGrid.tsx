import Link from "next/link";
import type { Category } from "@/types/product";

interface CategoryGridProps {
  categories: Category[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  vitamin: "💊",
  probiotics: "🦠",
  omega3: "🐟",
  mineral: "⚗️",
  collagen: "✨",
  kids: "👶",
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="flex flex-col items-center gap-2 py-4 bg-surface-elevated border border-border-subtle rounded-2xl hover:border-text-quaternary transition-colors"
        >
          <span className="text-2xl">{CATEGORY_EMOJIS[category.slug] || "📦"}</span>
          <span className="text-[12px] text-text-secondary font-medium">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
