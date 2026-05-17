interface StatusBadgeProps {
  status: "active" | "warning" | "inactive";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: "bg-brand-pink-light text-brand border-brand",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const labels = {
    active: "Active",
    warning: "Warning",
    inactive: "Inactive",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
