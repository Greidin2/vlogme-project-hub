import type { WorkResource } from "../../config/links";
import { StatusBadge } from "./StatusBadge";

type ResourceCardProps = {
  resource: WorkResource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const isActive = (resource.status === "ready" || resource.status === "local") && resource.url;
  const opensInNewTab = Boolean(resource.external || resource.status === "local");
  const note = resource.note ?? (resource.status === "individual" ? "Ссылку предоставляет руководитель." : undefined);

  return (
    <article className="hub-card">
      <div className="hub-card__top">
        <h3>{resource.title}</h3>
        <StatusBadge status={resource.status} />
      </div>
      <p>{resource.description}</p>
      {note ? <p className="hub-card__note">{note}</p> : null}
      {isActive ? (
        <a
          className="hub-action"
          href={resource.url}
          target={opensInNewTab ? "_blank" : undefined}
          rel={opensInNewTab ? "noopener noreferrer" : undefined}
          aria-label={`${resource.buttonLabel}: ${resource.title}${opensInNewTab ? ", откроется в новой вкладке" : ""}`}
        >
          {resource.buttonLabel}
          {opensInNewTab ? <span aria-hidden="true"> ↗</span> : null}
        </a>
      ) : (
        <span className="hub-action hub-action--disabled" aria-disabled="true">
          {resource.buttonLabel}
        </span>
      )}
    </article>
  );
}
