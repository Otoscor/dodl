"use client";

import { useState } from "react";
import Link from "next/link";
import type { Banner } from "@/types/product";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden mx-6 rounded-[10px]">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link_url}
              className="min-w-full bg-[#f5f5f5] px-6 py-4 flex flex-col justify-end aspect-[4/3]"
            >
              <h2 className="text-[28px] text-black uppercase tracking-[0.04em] mb-1">
                {banner.title}
              </h2>
              <p className="text-[13px] text-[#888] uppercase tracking-[0.08em]">{banner.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                i === current ? "bg-black" : "bg-[#e0e0e0]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
