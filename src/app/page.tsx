import Link from "next/link";

const cards = [
  {
    href: "/home",
    external: false,
    icon: "storefront",
    title: "프로토타입",
    description: "커머스 탭 실제 동작 확인",
    cta: "열기",
    primary: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col px-6 py-12 bg-surface-base">
      {/* 헤더 */}
      <header className="mb-12">
        <h1 className="text-[28px] text-text-primary tracking-tight">
          dodl
        </h1>
        <p className="text-[14px] text-text-secondary mt-1">
          헬스케어 앱 커머스 탭 프로토타입
        </p>
        <div className="mt-4 h-px bg-border-subtle" />
      </header>

      {/* 카드 목록 */}
      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const inner = (
            <div
              className={`
                flex items-center gap-4 p-5 rounded-[10px] border transition-colors
                ${card.primary
                  ? "bg-action-primary border-action-primary text-white"
                  : "bg-surface-elevated border-border-subtle hover:bg-[#ebebeb]"
                }
              `}
            >
              {/* 아이콘 */}
              <span className={`material-icons-outlined text-[24px] shrink-0 ${card.primary ? "text-white" : "text-[#888]"}`}>{card.icon}</span>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[15px] ${
                    card.primary ? "text-white" : "text-text-primary"
                  }`}
                >
                  {card.title}
                </p>
                <p
                  className={`text-[12px] mt-0.5 ${
                    card.primary ? "text-white/70" : "text-text-tertiary"
                  }`}
                >
                  {card.description}
                </p>
              </div>

              {/* CTA 레이블 */}
              <span
                className={`text-[12px] shrink-0 ${
                  card.primary ? "text-white/80" : "text-text-quaternary"
                }`}
              >
                {card.cta} →
              </span>
            </div>
          );

          return card.external ? (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          ) : (
            <Link key={card.title} href={card.href}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* 푸터 */}
      <footer className="mt-auto pt-12 text-center">
        <p className="text-[11px] text-text-quaternary">
          Next.js 16 · TypeScript · Tailwind CSS · SQLite
        </p>
      </footer>
    </div>
  );
}
