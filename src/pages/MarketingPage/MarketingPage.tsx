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

export function MarketingPage() {
  const tools = getResources(["marketing-hub", "creator-kit-ru", "creator-kit-en", "marketing-guide", "telegram-marketing"]);

  return (
    <div className="hub-page">
      <PageHeader title="Маркетинг" description="Поиск источников, переговоры, рекламные заказы и анализ результатов." />
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
            "Найти подходящий источник.",
            "Зарегистрировать источник в Marketing Hub.",
            "Сделать разбор через ChatGPT.",
            "Оценить источник.",
            "Провести переговоры.",
            "Создать рекламный заказ.",
            "После размещения заполнить аналитику.",
          ]}
        />
      </section>

      <section className="hub-panel section-anchor" id="rules">
        <SectionTitle title="Короткие правила" headingId="rules-heading" focusable />
        <ul className="hub-rule-list">
          <li>Каждый найденный источник регистрируется в базе.</li>
          <li>Источники оцениваются по единой системе.</li>
          <li>Переговоры ведутся одновременно с несколькими источниками.</li>
          <li>Начальную стоимость необходимо обсуждать.</li>
          <li>Согласованное размещение оформляется на листе «Заказы».</li>
          <li>После выхода размещения заполняются результаты.</li>
          <li>Creator Kit используется при работе с авторами и партнёрами.</li>
          <li>Русская и английская версии Creator Kit будут расширяться.</li>
        </ul>
      </section>

      <section className="hub-panel section-anchor" id="help">
        <SectionTitle title="Контакт" headingId="help-heading" focusable />
        <NoticeCard title="Greidin Z — Валентин Козлов">
          <p>По вопросам таблиц, материалов, документов, доступов, рекламных заказов и рабочего процесса.</p>
        </NoticeCard>
      </section>
      <a className="hub-action hub-action--secondary" href="#main-content">
        Наверх
      </a>
    </div>
  );
}
