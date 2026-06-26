import { Link } from "react-router-dom";
import { NoticeCard } from "../../components/Hub/NoticeCard";
import { PageHeader } from "../../components/Hub/PageHeader";
import { ResourceCard } from "../../components/Hub/ResourceCard";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { WorkflowSteps } from "../../components/Hub/WorkflowSteps";
import { SectionNavigation } from "../../components/SectionNavigation/SectionNavigation";
import { getResource, getResources } from "../../config/links";

const sectionItems = [
  { id: "tools", label: "Инструменты" },
  { id: "workflow", label: "Маршрут" },
  { id: "rules", label: "Правила" },
  { id: "help", label: "Помощь" },
];

export function ContentPage() {
  const tools = getResources(["trello-smm", "content-kpi", "vlogme-create", "prompts-doc", "content-manager-guide"]);
  const videoTopic = getResource("telegram-video-tasks");

  return (
    <div className="hub-page">
      <PageHeader title="Контент-менеджер" description="Темы, создание видео, промпты и передача готовых пачек." />
      <SectionNavigation items={sectionItems} />

      <section className="hub-panel section-anchor" id="tools">
        <SectionTitle title="Основные инструменты" headingId="tools-heading" focusable />
        <div className="hub-grid">
          {tools.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="hub-panel section-anchor" id="workflow">
        <SectionTitle title="Рабочий маршрут" headingId="workflow-heading" focusable />
        <WorkflowSteps
          steps={[
            "Открыть заказ или создать собственную карточку в Trello.",
            "Проверить или создать тематику и получить код темы.",
            "Создать пачку видео в Vlogme.ai.",
            "Заполнить подряд все строки пачки на листе «Видео».",
            "Сохранить промпты и финальные сценарии в личном документе.",
            "Перенести карточку в «Готово к публикации».",
          ]}
        />
      </section>

      <section className="hub-panel section-anchor" id="rules">
        <SectionTitle title="Правила" headingId="rules-heading" focusable />
        <div className="hub-split">
          <NoticeCard title="Оранжевая карточка">
            <p>Заказ на видео от Platform Lead.</p>
          </NoticeCard>
          <NoticeCard title="Серая карточка">
            <p>Собственная тема контент-менеджера.</p>
          </NoticeCard>
        </div>
        <ul className="hub-rule-list">
          <li>Перед началом работы добавьте себя участником карточки.</li>
          <li>Все видео одной пачки должны идти подряд в таблице.</li>
          <li>Количество видео должно совпадать с количеством в карточке Trello.</li>
          <li>Промпты и сценарии сохраняются в личном документе.</li>
          <li>Готовая пачка передаётся через колонку «Готово к публикации».</li>
          <li>Аккаунты публикации и платформенные галочки ведёт Platform Lead.</li>
        </ul>
        <NoticeCard title="Если не появился код">
          <p>
            Если код темы или видео не появился, используйте меню «Синхронизация» в таблице «Контент и KPI».
            Если повторная проверка не помогла, обратитесь к @greidin.
          </p>
        </NoticeCard>
      </section>

      <section className="hub-panel section-anchor" id="help">
        <SectionTitle title="Помощь" headingId="help-heading" focusable />
        <div className="hub-grid">
          <ResourceCard resource={videoTopic} />
          <NoticeCard title="Проблема с таблицей, Trello, документом или процессом">
            <p>Контакт: Greidin Z — Валентин Козлов.</p>
          </NoticeCard>
          <NoticeCard title="Техническая ошибка">
            <Link className="hub-action" to="/help">
              Перейти в «Помощь и ошибки»
            </Link>
          </NoticeCard>
        </div>
      </section>
      <a className="hub-action hub-action--secondary" href="#main-content">
        Наверх
      </a>
    </div>
  );
}
