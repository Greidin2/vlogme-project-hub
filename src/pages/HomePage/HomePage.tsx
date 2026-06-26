import { AnnouncementList } from "../../components/Hub/AnnouncementList";
import { PageHeader } from "../../components/Hub/PageHeader";
import { ProjectCard } from "../../components/Hub/ProjectCard";
import { ResourceCard } from "../../components/Hub/ResourceCard";
import { RoleCard } from "../../components/Hub/RoleCard";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { WorkflowSteps } from "../../components/Hub/WorkflowSteps";
import { getResources } from "../../config/links";
import { siteConfig } from "../../config/site";

export function HomePage() {
  const quickResources = getResources(["vlogme", "vlogme-create", "vpn", "trello-internal-tasks"]);

  return (
    <div className="hub-page">
      <PageHeader
        eyebrow="Внутренний портал"
        title="Рабочий центр команды Vlogme.ai"
        description="Инструменты, инструкции и контакты в одном месте"
        note="Выберите свою роль или откройте раздел помощи."
      />

      <section className="hub-panel">
        <SectionTitle title="Выберите раздел" />
        <div className="hub-grid">
          <RoleCard
            title="Контент-менеджер"
            description="Темы, промпты, создание видео и передача готовых пачек."
            to="/content"
            buttonLabel="Открыть раздел"
          />
          <RoleCard
            title="Platform Lead"
            description="Аккаунты, заказы на видео и публикация контента."
            to="/publication"
            buttonLabel="Открыть раздел"
          />
          <RoleCard
            title="Маркетинг"
            description="Источники, переговоры, рекламные заказы и аналитика."
            to="/marketing"
            buttonLabel="Открыть раздел"
          />
          <RoleCard
            title="Помощь и ошибки"
            description="Инструкции, контакты и регистрация проблем."
            to="/help"
            buttonLabel="Получить помощь"
          />
        </div>
      </section>

      <ProjectCard />

      <section className="hub-panel">
        <SectionTitle
          title="Быстрые рабочие ссылки"
          description={`Версия Hub: ${siteConfig.version}. Основные роли: Контент-менеджер и Platform Lead.`}
        />
        <div className="hub-grid">
          {quickResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="hub-panel">
        <SectionTitle title="Важно сейчас" />
        <AnnouncementList />
      </section>

      <section className="hub-panel">
        <SectionTitle title="Как пользоваться" />
        <WorkflowSteps
          steps={[
            "Выберите свою роль.",
            "Откройте нужный рабочий инструмент.",
            "При вопросе перейдите в раздел «Помощь».",
          ]}
        />
      </section>
    </div>
  );
}
