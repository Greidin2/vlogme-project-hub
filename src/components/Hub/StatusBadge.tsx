import type { ResourceStatus } from "../../config/links";

const statusLabels: Record<ResourceStatus, string> = {
  ready: "Активно",
  individual: "Индивидуальная ссылка",
  missing: "Ссылка не добавлена",
  local: "PDF",
};

type StatusBadgeProps = {
  status: ResourceStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className="hub-badge">{statusLabels[status]}</span>;
}
