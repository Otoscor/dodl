"use client";

import { useState } from "react";
import Link from "next/link";
import type { Banner } from "@/types/product";

interface BannerCarouselProps {
  banners: Banner[];
}

const BANNER_COLORS = [
  "from-action-primary/20 to-action-primary/5",
  "from-label-pink/20 to-label-pink/5",
  "from-accent-amber/20 to-accent-amber/5",
];

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl mx-4">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <Link
              key={banner.id}
              href={banner.link_url}
              className={`min-w-full bg-gradient-to-br ${BANNER_COLORS[i % BANNER_COLORS.length]} p-6 flex flex-col justify-end aspect-[2/1]`}
            >
              <h2 className="text-[18px] font-medium text-text-primary mb-1">
                {banner.title}
              </h2>
              <p className="text-[13px] text-text-secondary">{banner.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                i === current ? "bg-action-primary" : "bg-text-quaternary"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
