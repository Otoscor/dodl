// 상단 상태바 (9:30 + wifi/신호/배터리). Figma statusBar 재현 — 인라인 SVG.
export default function StatusBar() {
  return (
    <div className="flex h-[52px] w-full items-end justify-between overflow-clip px-[24px] py-[10px]">
      <p className="text-[14px] font-medium leading-[20px] tracking-[0.14px] text-[#1a1919]">
        9:30
      </p>
      <div className="flex items-center gap-[5px]">
        {/* 신호 */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="#1a1919" aria-hidden>
          <rect x="0" y="7.5" width="3" height="3.5" rx="0.6" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" />
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1a1919" aria-hidden>
          <path d="M8 2.2c2.5 0 4.8 1 6.5 2.6l-1.2 1.3A7.5 7.5 0 0 0 8 4.1 7.5 7.5 0 0 0 2.7 6.1L1.5 4.8A9.4 9.4 0 0 1 8 2.2Z" />
          <path d="M8 5.6c1.6 0 3 .6 4.1 1.6l-1.3 1.3A3.9 3.9 0 0 0 8 7.5c-1.1 0-2.1.4-2.8 1L3.9 7.2A5.8 5.8 0 0 1 8 5.6Z" />
          <path d="M8 9c.9 0 1.6.7 1.6 1.5H6.4C6.4 9.7 7.1 9 8 9Z" />
        </svg>
        {/* 배터리 */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#1a1919" strokeOpacity="0.35" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#1a1919" />
          <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="#1a1919" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
