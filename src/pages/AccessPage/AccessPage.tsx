import { Link } from "react-router-dom";
import { NoticeCard } from "../../components/Hub/NoticeCard";
import { PageHeader } from "../../components/Hub/PageHeader";
import { ResourceCard } from "../../components/Hub/ResourceCard";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { WorkflowSteps } from "../../components/Hub/WorkflowSteps";
import { AccessIdentityBadge } from "../../components/Hub/AccessIdentityBadge";
import { SectionNavigation } from "../../components/SectionNavigation/SectionNavigation";
import { getResource } from "../../config/links";
import { appRoutes } from "../../config/routes";

const sectionItems = [
  { id: "flow", label: "Как работает" },
  { id: "roles", label: "Роли" },
  { id: "source-of-truth", label: "Источник" },
  { id: "admin", label: "Админ" },
  { id: "help", label: "Проверка" },
];

export function AccessPage() {
  const adminEmail = getResource("email-greidin");

  return (
    <div className="hub-page">
      <PageHeader
        eyebrow="Авторизация"
        title="Доступ по Gmail"
        description="Вход в Hub выполняется через Google-аккаунт и Cloudflare Access. React показывает только текущую учётную запись и состояние входа."
        note="Разрешённые почты и роли должны храниться вне React, в облачной политике или внешней базе."
      />
      <SectionNavigation items={sectionItems} />

      <section className="hub-panel section-anchor" id="flow">
        <SectionTitle title="Как работает вход" headingId="flow-heading" focusable />
        <div className="hub-split">
          <WorkflowSteps
            steps={[
              "Пользователь открывает Hub.",
              "Cloudflare Access перенаправляет на вход через Google.",
              "Политика допуска проверяет email по разрешённому списку.",
              "Если почта разрешена, пользователь попадает в Hub.",
              "В шапке показывается email вошедшего пользователя.",
              "Для выхода используется ссылка /cdn-cgi/access/logout.",
            ]}
          />
          <NoticeCard title="Текущий вход">
            <AccessIdentityBadge />
          </NoticeCard>
        </div>
      </section>

      <section className="hub-panel section-anchor" id="roles">
        <SectionTitle
          title="Роли в портале"
          description="Роли определяют, какие разделы и рабочие сценарии доступны пользователю. Сами правила доступа должны приходить из внешнего источника, а не из интерфейса."
          headingId="roles-heading"
          focusable
        />
        <div className="hub-grid">
          <article className="hub-card">
            <h3>Контент-менеджер</h3>
            <p>Доступ к разделу с темами, промптами, созданием видео и передачей пачек.</p>
            <Link className="hub-action hub-action--secondary" to="/content">
              Открыть раздел
            </Link>
          </article>
          <article className="hub-card">
            <h3>Platform Lead</h3>
            <p>Доступ к аккаунтам, заказам на видео и публикации контента.</p>
            <Link className="hub-action hub-action--secondary" to="/publication">
              Открыть раздел
            </Link>
          </article>
          <article className="hub-card">
            <h3>Маркетинг</h3>
            <p>Доступ к источникам, переговорам, рекламным заказам и аналитике.</p>
            <Link className="hub-action hub-action--secondary" to="/marketing">
              Открыть раздел
            </Link>
          </article>
          <article className="hub-card">
            <h3>Помощь</h3>
            <p>Инструкции, контакты и оформление технических ошибок.</p>
            <Link className="hub-action hub-action--secondary" to="/help">
              Открыть раздел
            </Link>
          </article>
        </div>
      </section>

      <section className="hub-panel section-anchor" id="source-of-truth">
        <SectionTitle
          title="Где хранить разрешённые почты и роли"
          description="Не в React. Клиент должен только отображать результат входа, а сам список допуска нужно вести в Cloudflare Access или во внешней базе, откуда его можно синхронизировать в политику доступа."
          headingId="source-of-truth-heading"
          focusable
        />
        <div className="hub-grid hub-grid--three">
          <NoticeCard title="React">
            <p>Показывает email вошедшего пользователя и ссылку выхода. Не является защитой и не хранит allowlist.</p>
          </NoticeCard>
          <NoticeCard title="Cloudflare Access">
            <p>Проверяет Google-аккаунт, ограничивает вход и завершает сессию до загрузки статического сайта.</p>
          </NoticeCard>
          <NoticeCard title="Внешняя база">
            <p>Здесь можно вести рабочий список разрешённых адресов, назначение ролей и отчёты. Backend хранит это отдельно от React.</p>
          </NoticeCard>
        </div>
      </section>

      <section className="hub-panel section-anchor" id="admin">
        <SectionTitle title="Админская почта" headingId="admin-heading" focusable />
        <div className="hub-split">
          <NoticeCard title="Точка входа для настройки">
            <p>Основной контакт для администрирования доступа: greidin2010@gmail.com.</p>
            <p>Через этот адрес удобнее подтверждать список допуска, менять роли и проверять политику Cloudflare Access.</p>
            <Link className="hub-action" to={appRoutes.admin}>
              Открыть админку
            </Link>
          </NoticeCard>
          <ResourceCard resource={adminEmail} />
        </div>
      </section>

      <section className="hub-panel section-anchor" id="help">
        <SectionTitle title="Проверка после настройки" headingId="help-heading" focusable />
        <WorkflowSteps
          steps={[
            "Открыть Hub в обычном окне браузера.",
            "Проверить вход с разрешённой Gmail-почты.",
            "Проверить отказ для неразрешённой почты.",
            "Убедиться, что в шапке отображается email пользователя.",
            "Проверить выход через /cdn-cgi/access/logout.",
          ]}
        />
      </section>

      <a className="hub-action hub-action--secondary" href="#main-content">
        Наверх
      </a>
    </div>
  );
}
