import Link from "next/link";

interface TitleBarProps {
  title: string;
  titleHref?: string;
  rightAction?: React.ReactNode;
}

export function TitleBar({ title, titleHref, rightAction }: TitleBarProps) {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-white">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-[28px] tracking-[-0.02em] text-black">
          {titleHref ? (
            <Link href={titleHref} className="underline underline-offset-4">{title}</Link>
          ) : (
            title
          )}
        </h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
