import { useEffect, useMemo, useState } from "react";
import { AccessGate } from "../../components/Hub/AccessGate";
import { NoticeCard } from "../../components/Hub/NoticeCard";
import { PageHeader } from "../../components/Hub/PageHeader";
import { SectionNavigation } from "../../components/SectionNavigation/SectionNavigation";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { listHistoryEntries, type HistoryFilters, type ReportItem } from "../../services/adminApi";

const roleOptions = [
  { value: "", label: "Все роли" },
  { value: "admin", label: "Админ" },
  { value: "content-manager", label: "Контент-менеджер" },
  { value: "platform-lead", label: "Platform Lead" },
  { value: "marketing", label: "Маркетинг" },
  { value: "viewer", label: "Просмотр" },
];

const tabItems = [
  { id: "reports", label: "Отчёты" },
  { id: "meetings", label: "Созвоны" },
  { id: "filters", label: "Фильтры" },
];

const allRoles = ["admin", "content-manager", "platform-lead", "marketing", "viewer"] as const;

type HistoryTab = "reports" | "meetings";

const initialFilters: Required<Pick<HistoryFilters, "role" | "email" | "from" | "to" | "q">> = {
  role: "",
  email: "",
  from: "",
  to: "",
  q: "",
};

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>("reports");
  const [filters, setFilters] = useState(initialFilters);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [meetings, setMeetings] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMessage("");

      const normalizedFilters: HistoryFilters = {
        role: filters.role || undefined,
        email: filters.email || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
      };

      const [reportsResult, meetingsResult] = await Promise.all([
        listHistoryEntries("report", normalizedFilters),
        listHistoryEntries("meeting", normalizedFilters),
      ]);

      if (!alive) {
        return;
      }

      if (reportsResult.ok) {
        setReports(reportsResult.data.reports ?? []);
      } else {
        setErrorMessage(reportsResult.message);
      }

      if (meetingsResult.ok) {
        setMeetings(meetingsResult.data.meetings ?? []);
      } else if (!reportsResult.ok) {
        setErrorMessage(meetingsResult.message);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [filters]);

  const activeCount = activeTab === "reports" ? reports.length : meetings.length;
  const summary = useMemo(() => buildSummary(reports, meetings), [reports, meetings]);

  return (
    <AccessGate allowedRoles={[...allRoles]} title="История" description="Проверяем рабочую учётную запись.">
      <div className="hub-page">
        <PageHeader
          eyebrow="История"
          title="Отчёты, даты и созвоны"
          description="Одна вкладка для всей командной истории: отчёты сотрудников, фильтры по ролям и почте, а также записи общих созвонов по неделям."
          note="Файлы и заметки хранятся на backend, а не в React."
        />

        <SectionNavigation items={tabItems} />

        <section className="hub-panel section-anchor" id="reports">
          <SectionTitle
            title="Общая история"
            description="Все активные сотрудники видят все записи. Можно отфильтровать по роли, email и датам."
            headingId="history-heading"
            focusable
          />
          <div className="hub-grid hub-grid--three">
            <NoticeCard title="Отчёты">
              <p>{summary.reportCount}</p>
            </NoticeCard>
            <NoticeCard title="Созвоны">
              <p>{summary.meetingCount}</p>
            </NoticeCard>
            <NoticeCard title="Покрытие">
              <p>{summary.dateRange}</p>
            </NoticeCard>
          </div>

          <div className="hub-actions" style={{ marginTop: 20 }}>
            <button className={activeTab === "reports" ? "hub-action" : "hub-action hub-action--secondary"} type="button" onClick={() => setActiveTab("reports")}>
              Отчёты
            </button>
            <button className={activeTab === "meetings" ? "hub-action" : "hub-action hub-action--secondary"} type="button" onClick={() => setActiveTab("meetings")}>
              Созвоны
            </button>
          </div>
        </section>

        <section className="hub-panel section-anchor" id="filters">
          <SectionTitle
            title="Фильтры"
            description="Используйте email, роль и диапазон дат, чтобы быстро найти нужную запись."
            headingId="filters-heading"
            focusable
          />
          <div className="hub-split">
            <form className="hub-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Роль</span>
                <select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={filters.email}
                  onChange={(event) => setFilters({ ...filters, email: event.target.value })}
                  placeholder="name@gmail.com"
                />
              </label>
              <label>
                <span>С даты</span>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) => setFilters({ ...filters, from: event.target.value })}
                />
              </label>
              <label>
                <span>По дату</span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(event) => setFilters({ ...filters, to: event.target.value })}
                />
              </label>
              <label>
                <span>Поиск</span>
                <input
                  type="text"
                  value={filters.q}
                  onChange={(event) => setFilters({ ...filters, q: event.target.value })}
                  placeholder="Тема, заметка, почта"
                />
              </label>
              <button className="hub-action hub-action--secondary" type="button" onClick={() => setFilters(initialFilters)}>
                Сбросить фильтры
              </button>
            </form>

            <NoticeCard title="Как читать историю">
              <p>Отчёты показывают рабочие результаты по людям и ролям. Созвоны лучше смотреть по неделям: так легче восстановить решения и договорённости.</p>
              <p>Если нужно быстро найти конкретную запись, начинайте с email и диапазона дат.</p>
            </NoticeCard>
          </div>
        </section>

        <section className="hub-panel section-anchor" id="meetings">
          <SectionTitle
            title={activeTab === "reports" ? "Отчёты команды" : "История созвонов"}
            description={loading ? "Загружаем записи..." : `Найдено записей: ${activeCount}`}
            headingId="entries-heading"
            focusable
          />
          {errorMessage ? <NoticeCard title="Ошибка">{errorMessage}</NoticeCard> : null}
          {activeTab === "reports" ? (
            <div className="hub-list-grid">
              {reports.map((report) => (
                <HistoryEntryCard key={report.id} entry={report} />
              ))}
              {!loading && reports.length === 0 ? <NoticeCard title="Нет записей">Под выбранные фильтры ничего не найдено.</NoticeCard> : null}
            </div>
          ) : (
            <div className="hub-list-grid">
              {groupMeetingsByWeek(meetings).map((group) => (
                <article className="hub-panel" key={group.weekKey}>
                  <SectionTitle title={group.label} description={`${group.items.length} записей`} />
                  <div className="hub-list-grid">
                    {group.items.map((meeting) => (
                      <HistoryEntryCard key={meeting.id} entry={meeting} />
                    ))}
                  </div>
                </article>
              ))}
              {!loading && meetings.length === 0 ? <NoticeCard title="Нет созвонов">Под выбранные фильтры нет записей.</NoticeCard> : null}
            </div>
          )}
        </section>

        <a className="hub-action hub-action--secondary" href="#main-content">
          Наверх
        </a>
      </div>
    </AccessGate>
  );
}

function HistoryEntryCard({ entry }: { entry: ReportItem }) {
  const isMeeting = entry.kind === "meeting";

  return (
    <article className="hub-card">
      <div className="hub-card__top">
        <h3>{entry.title}</h3>
        <span className="hub-badge">
          {isMeeting ? (entry.meetingFormat === "google-doc" ? "Google Doc" : "Текст") : entry.category}
        </span>
      </div>
      {isMeeting && entry.meetingFormat === "google-doc" ? (
        <>
          <p>{entry.description || "Без описания"}</p>
          <p className="hub-card__note">
            {entry.googleDocUrl ? (
              <a href={entry.googleDocUrl} target="_blank" rel="noreferrer">
                Открыть Google Doc
              </a>
            ) : (
              "Ссылка не указана"
            )}
          </p>
        </>
      ) : (
        <p>{entry.description || "Без описания"}</p>
      )}
      <p className="hub-card__note">
        {entry.submittedBy.email} · {entry.submittedBy.role ?? "viewer"} · {entry.eventDate}
      </p>
      {entry.attachments.length > 0 ? (
        <ul className="hub-report-files">
          {entry.attachments.map((file) => (
            <li key={file.id}>
              <a href={file.downloadUrl ?? undefined}>{file.originalName}</a>
              <span>{formatFileSize(file.size)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function buildSummary(reports: ReportItem[], meetings: ReportItem[]) {
  const dates = [...reports, ...meetings]
    .map((item) => item.eventDate)
    .filter(Boolean)
    .sort();

  return {
    reportCount: reports.length,
    meetingCount: meetings.length,
    dateRange: dates.length ? `${dates[0]} — ${dates[dates.length - 1]}` : "Нет данных",
  };
}

function groupMeetingsByWeek(meetings: ReportItem[]) {
  const groups = new Map<string, { weekKey: string; label: string; items: ReportItem[] }>();

  for (const meeting of meetings) {
    const weekKey = getWeekKey(meeting.eventDate);
    const current = groups.get(weekKey);

    if (current) {
      current.items.push(meeting);
      continue;
    }

    groups.set(weekKey, {
      weekKey,
      label: formatWeekLabel(meeting.eventDate),
      items: [meeting],
    });
  }

  return Array.from(groups.values()).sort((left, right) => right.weekKey.localeCompare(left.weekKey));
}

function getWeekKey(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return `Неделя ${monday.toLocaleDateString("ru-RU")} - ${sunday.toLocaleDateString("ru-RU")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
