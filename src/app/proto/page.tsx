import Link from "next/link";

// 프로세스 프로토타입 허브 — Figma Dev 코드 100% 기반 프로세스별 프로토타입 인덱스.
// proto 레이아웃(격리: Inter/Pretendard, 흑백·monospace 상속 차단) 아래 렌더링.
const protos = [
  {
    href: "/proto/cart",
    emoji: "🛒",
    title: "장바구니",
    description: "정책·엣지케이스 프로토타입",
  },
  {
    href: "/proto/gift",
    emoji: "🎁",
    title: "선물하기 (발신자)",
    description: "실물배송형 와이어프레임 + 정책 주석",
  },
  {
    href: "/proto/scanner",
    emoji: "🔍",
    title: "단백질 스캐너",
    description: "3-스텝 추천 퀴즈",
  },
];

export default function ProtoHubPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white px-6 py-12">
      <header className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1a1919]">두들 프로토타입</h1>
        <p className="mt-1 text-[14px] text-[#8a8585]">Figma 디자인 기반 프로세스별 프로토타입</p>
        <div className="mt-4 h-px bg-[rgba(26,25,25,0.08)]" />
      </header>

      <div className="flex flex-col gap-3">
        {protos.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="flex items-center gap-4 rounded-[16px] border border-[rgba(26,25,25,0.08)] bg-white p-5 transition-colors hover:bg-[#fafafa]"
          >
            <span className="text-[24px]">{p.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-[#1a1919]">{p.title}</p>
              <p className="mt-0.5 text-[12px] text-[#8a8585]">{p.description}</p>
            </div>
            <span className="text-[12px] text-[#bebbbb]">열기 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
