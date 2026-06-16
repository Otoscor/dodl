"use client";

import { ListRow } from "./ListRow";

export interface ListSectionItem {
  label: string;
  value?: string;
  onClick?: () => void;
}

interface ListSectionProps {
  title: string;
  items: ListSectionItem[];
}

export function ListSection({ title, items }: ListSectionProps) {
  return (
    <div className="bg-white">
      <p className="px-5 pt-5 pb-3 text-[16px] font-semibold text-black">{title}</p>
      {items.map((item, i) => (
        <ListRow key={i} label={item.label} value={item.value} onClick={item.onClick} />
      ))}
    </div>
  );
}
