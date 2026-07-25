interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = "📋",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}
