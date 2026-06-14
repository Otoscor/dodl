export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-6 h-6 border-2 border-[#e0e0e0] border-t-black rounded-full animate-spin" />
    </div>
  );
}
