import { Link } from "react-router-dom";
import { getResource } from "../../config/links";
import { projectConfig } from "../../config/project";

export function ProjectCard() {
  const site = getResource(projectConfig.siteResourceId);

  return (
    <section className="hub-panel" aria-labelledby="project-card-title">
      <div className="hub-section-title">
        <h2 id="project-card-title">{projectConfig.title}</h2>
        <p>{projectConfig.description}</p>
      </div>
      <dl className="hub-meta-list">
        <div>
          <dt>Статус</dt>
          <dd>{projectConfig.status}</dd>
        </div>
        <div>
          <dt>Ответственный</dt>
          <dd>{projectConfig.owner}</dd>
        </div>
        <div>
          <dt>Текущий фокус</dt>
          <dd>{projectConfig.focus}</dd>
        </div>
      </dl>
      <div className="hub-actions">
        <a className="hub-action" href={site.url} target="_blank" rel="noopener noreferrer">
          Открыть Vlogme.ai <span aria-hidden="true">↗</span>
        </a>
        <Link className="hub-action hub-action--secondary" to="/content">
          Выбрать роль
        </Link>
        <Link className="hub-action hub-action--secondary" to="/help">
          Сообщить о проблеме
        </Link>
      </div>
    </section>
  );
}
