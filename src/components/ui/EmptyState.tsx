interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "📦", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-[15px] font-medium text-text-secondary mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-text-tertiary mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
