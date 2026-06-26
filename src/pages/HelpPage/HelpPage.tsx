import { Link } from "react-router-dom";
import { PageHeader } from "../../components/Hub/PageHeader";
import { QuickNav } from "../../components/Hub/QuickNav";
import { ResourceCard } from "../../components/Hub/ResourceCard";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { WorkflowSteps } from "../../components/Hub/WorkflowSteps";
import { getResource, getResources } from "../../config/links";

export function HelpPage() {
  const greidinTelegram = getResource("telegram-greidin");
  const greidinEmail = getResource("email-greidin");
  const techTelegram = getResource("telegram-abalex");
  const techEmail = getResource("email-abalex");
  const qaTelegram = getResource("telegram-qa");
  const qaEmail = getResource("email-qa");
  const teamContacts = getResources([
    "telegram-andrey",
    "email-andrey",
    "telegram-alina",
    "email-alina",
    "telegram-ramil",
    "email-ramil",
    "telegram-anya",
    "email-anya",
  ]);
  const bugResources = getResources(["bug-tracker-board", "bug-tracker-guide", "telegram-errors"]);
  const telegramTopics = getResources([
    "telegram-main-group",
    "telegram-general",
    "telegram-video-tasks",
    "telegram-publication",
    "telegram-marketing",
    "telegram-accounts",
    "telegram-upgrades",
    "telegram-fun",
  ]);

  return (
    <div className="hub-page">
      <PageHeader title="Помощь и ошибки" description="Выберите ситуацию и выполните указанные действия." />
      <QuickNav
        items={[
          { href: "#scenarios", label: "Сценарии" },
          { href: "#bug-tracker", label: "Bug Tracker" },
          { href: "#telegram", label: "Telegram" },
          { href: "#contacts", label: "Контакты" },
        ]}
      />

      <section className="hub-panel" id="scenarios">
        <SectionTitle title="Не понимаю, как выполнить задачу" />
        <WorkflowSteps
          steps={[
            "Откройте инструкцию своей роли.",
            "Найдите нужный рабочий сценарий.",
            "Если ответа нет, задайте вопрос в профильной Telegram-теме.",
            "Укажите код темы или видео, ссылку на Trello или таблицу и конкретный вопрос.",
          ]}
        />
        <div className="hub-actions">
          <Link className="hub-action hub-action--secondary" to="/content">
            Контент-менеджер
          </Link>
          <Link className="hub-action hub-action--secondary" to="/publication">
            Platform Lead
          </Link>
          <Link className="hub-action hub-action--secondary" to="/marketing">
            Маркетинг
          </Link>
        </div>
      </section>

      <section className="hub-panel">
        <SectionTitle title="Проблема с таблицей, Trello, документом или процессом" />
        <p>Контакт: Greidin Z — Валентин Козлов.</p>
        <ul className="hub-rule-list">
          <li>таблицы;</li>
          <li>Trello;</li>
          <li>документы;</li>
          <li>материалы;</li>
          <li>контент;</li>
          <li>доступы;</li>
          <li>рабочие процессы;</li>
          <li>организационные вопросы.</li>
        </ul>
        <div className="hub-grid">
          <ResourceCard resource={greidinTelegram} />
          <ResourceCard resource={greidinEmail} />
        </div>
      </section>

      <section className="hub-panel" id="bug-tracker">
        <SectionTitle title="Техническая ошибка" />
        <WorkflowSteps
          steps={[
            "Открыть Bug Tracker.",
            "Создать карточку из шаблона во «Входящих».",
            "Описать, что сломалось.",
            "Добавить шаги воспроизведения.",
            "Приложить скриншот или текст ошибки.",
            "Указать устройство, операционную систему и браузер.",
            "Добавить ссылку на страницу, таблицу или документ.",
            "Добавить себя участником карточки.",
            "Добавить Greidin Z.",
            "Для проблемы разработки добавить соответствующего разработчика или QA.",
            "Отправить ссылку на карточку в Telegram-тему «Ошибки».",
          ]}
        />
      </section>

      <section className="hub-panel">
        <SectionTitle title="Критичность ошибки" />
        <div className="hub-grid hub-grid--three">
          <article className="hub-card">
            <h3>Критично</h3>
            <p>Сервис или основная функция недоступны, работа остановлена.</p>
          </article>
          <article className="hub-card">
            <h3>Важно</h3>
            <p>Функция работает неправильно или нестабильно, но работу можно продолжить.</p>
          </article>
          <article className="hub-card">
            <h3>Мелкий</h3>
            <p>Опечатка, визуальный дефект или незначительная проблема.</p>
          </article>
        </div>
      </section>

      <section className="hub-panel">
        <SectionTitle title="Ресурсы Bug Tracker" />
        <div className="hub-grid hub-grid--three">
          {bugResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="hub-panel" id="telegram">
        <SectionTitle title="Рабочие Telegram-темы" />
        <div className="hub-grid hub-grid--three">
          {telegramTopics.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="hub-panel" id="contacts">
        <SectionTitle
          title="Технические контакты"
          description="Алексей Бабкин подключается к проблемам разработки после создания карточки Bug Tracker. По таблицам, Trello, документам и рабочим процессам сначала обращайтесь к Greidin Z."
        />
        <div className="hub-grid">
          <ResourceCard resource={techTelegram} />
          <ResourceCard resource={techEmail} />
          <ResourceCard resource={qaTelegram} />
          <ResourceCard resource={qaEmail} />
        </div>
      </section>
      <section className="hub-panel">
        <SectionTitle title="Контакты команды" />
        <div className="hub-grid">
          {teamContacts.map((resource) => (
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
