interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "inventory_2", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <span className="material-icons-outlined text-[40px] text-[#e0e0e0] mb-4">{icon}</span>
      <h3 className="text-[15px] text-black uppercase tracking-[0.06em] mb-1">{title}</h3>
      {description && (
        <p className="text-[14px] text-[#888] mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
