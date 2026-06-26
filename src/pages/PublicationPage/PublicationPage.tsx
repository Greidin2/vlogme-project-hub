import { NoticeCard } from "../../components/Hub/NoticeCard";
import { PageHeader } from "../../components/Hub/PageHeader";
import { ResourceCard } from "../../components/Hub/ResourceCard";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { WorkflowSteps } from "../../components/Hub/WorkflowSteps";
import { SectionNavigation } from "../../components/SectionNavigation/SectionNavigation";
import { getResources } from "../../config/links";

const sectionItems = [
  { id: "tools", label: "Инструменты" },
  { id: "workflow", label: "Маршрут" },
  { id: "rules", label: "Правила" },
  { id: "help", label: "Помощь" },
];

export function PublicationPage() {
  const tools = getResources(["accounts-table", "trello-smm", "content-kpi", "publication-table", "platform-lead-guide"]);
  const telegramTopics = getResources(["telegram-publication", "telegram-video-tasks", "telegram-accounts"]);

  return (
    <div className="hub-page">
      <PageHeader title="Platform Lead" description="Аккаунты, создание заказов на видео и публикация контента." />
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
            "Создать или получить аккаунт.",
            "Зарегистрировать его в личной таблице аккаунтов.",
            "Провести прогрев и установить корректный статус.",
            "Создать тему и заказ на видео.",
            "Забрать готовую пачку из Trello.",
            "Выбрать видео в таблице «Контент и KPI».",
            "Проверить передачу роликов в таблицу «Публикация».",
            "Опубликовать контент и отметить завершение в Trello.",
          ]}
        />
      </section>

      <section className="hub-panel section-anchor" id="rules">
        <SectionTitle title="Правила" headingId="rules-heading" focusable />
        <div className="hub-grid hub-grid--three">
          <NoticeCard title="Аккаунты">
            <p>Создание, регистрация, прогрев и поддержание актуальных данных аккаунтов своей платформы.</p>
          </NoticeCard>
          <NoticeCard title="Темы и заказы">
            <p>Создание тематик и оранжевых карточек-заказов для контент-менеджеров.</p>
          </NoticeCard>
          <NoticeCard title="Публикация">
            <p>Выбор готовых видео, оформление и размещение контента на своей платформе.</p>
          </NoticeCard>
        </div>
        <ul className="hub-rule-list">
          <li>Прогревается.</li>
          <li>Активный.</li>
          <li>Заблокирован.</li>
        </ul>
        <p>Для публикации используются только аккаунты нужной платформы со статусом «Активный».</p>
        <NoticeCard title="Главное различие галочек">
          <p>
            Галочка платформы на листе «Видео» передаёт конкретный ролик в таблицу «Публикация».
            Галочка платформы в карточке Trello означает, что работа со всей пачкой на этой платформе завершена.
          </p>
        </NoticeCard>
      </section>

      <section className="hub-panel section-anchor" id="help">
        <SectionTitle title="Рабочие Telegram-темы" headingId="help-heading" focusable />
        <div className="hub-grid hub-grid--three">
          {telegramTopics.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>
      <a className="hub-action hub-action--secondary" href="#main-content">
        Наверх
      </a>
    </div>
  );
}
