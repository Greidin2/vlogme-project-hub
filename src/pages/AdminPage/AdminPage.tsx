import { useEffect, useState, type FormEvent } from "react";
import { AccessGate } from "../../components/Hub/AccessGate";
import { NoticeCard } from "../../components/Hub/NoticeCard";
import { PageHeader } from "../../components/Hub/PageHeader";
import { SectionTitle } from "../../components/Hub/SectionTitle";
import { SectionNavigation } from "../../components/SectionNavigation/SectionNavigation";
import { apiConfig } from "../../config/api";
import {
  createMeeting,
  createReport,
  listAccessEntries,
  listMeetings,
  listReports,
  removeAccessEntry,
  saveAccessEntry,
  type AccessEntry,
  type CurrentAccess,
  type MeetingFormat,
  type ReportAttachment,
  type ReportItem,
} from "../../services/adminApi";

const sectionItems = [
  { id: "access", label: "Доступы" },
  { id: "meetings-upload", label: "Созвоны" },
  { id: "reports", label: "Отчёты" },
];

const roleOptions = [
  { value: "admin", label: "Админ" },
  { value: "content-manager", label: "Контент-менеджер" },
  { value: "platform-lead", label: "Platform Lead" },
  { value: "marketing", label: "Маркетинг" },
  { value: "viewer", label: "Просмотр" },
] as const;

const categoryOptions = [
  { value: "general", label: "Общий" },
  { value: "content", label: "Контент" },
  { value: "publication", label: "Публикация" },
  { value: "marketing", label: "Маркетинг" },
  { value: "help", label: "Помощь" },
] as const;

type ReportCategory = Exclude<ReportItem["category"], "meeting">;

const emptyAccessEntry: AccessEntry = {
  email: "",
  name: "",
  role: "viewer",
  status: "active",
};

export function AdminPage() {
  const [currentAccess, setCurrentAccess] = useState<CurrentAccess | null>(null);
  const [accessEntries, setAccessEntries] = useState<AccessEntry[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [meetings, setMeetings] = useState<ReportItem[]>([]);
  const [entryForm, setEntryForm] = useState<AccessEntry>(emptyAccessEntry);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "general" as ReportCategory,
    eventDate: new Date().toISOString().slice(0, 10),
    file: null as File | null,
  });
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    meetingFormat: "text" as MeetingFormat,
    googleDocUrl: "",
    eventDate: new Date().toISOString().slice(0, 10),
    file: null as File | null,
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshData() {
    const [meResult, entriesResult, reportsResult, meetingsResult] = await Promise.all([
      fetch(apiConfig.me, { credentials: "same-origin", headers: { Accept: "application/json" } }),
      listAccessEntries(),
      listReports(),
      listMeetings(),
    ]);

    if (!meResult.ok) {
      return;
    }

    const me = (await meResult.json()) as CurrentAccess;
    setCurrentAccess(me);

    if (entriesResult.ok) {
      setAccessEntries(entriesResult.data.entries);
    }

    if (reportsResult.ok) {
      setReports(reportsResult.data.reports);
    }

    if (meetingsResult.ok) {
      setMeetings(meetingsResult.data.meetings);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      await refreshData();
      if (alive) {
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleEntrySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");

    const result = await saveAccessEntry(entryForm);
    if (!result.ok) {
      setStatusMessage(result.message);
      setSaving(false);
      return;
    }

    setEntryForm(emptyAccessEntry);
    setStatusMessage(`Доступ обновлён для ${result.data.entry.email}`);
    await refreshData();
    setSaving(false);
  }

  async function handleRemove(email: string) {
    setSaving(true);
    setStatusMessage("");
    const result = await removeAccessEntry(email);
    if (!result.ok) {
      setStatusMessage(result.message);
      setSaving(false);
      return;
    }

    setStatusMessage(`Доступ удалён для ${email}`);
    await refreshData();
    setSaving(false);
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");

    const attachments: ReportAttachment[] = [];

    if (reportForm.file) {
      const base64 = await fileToBase64(reportForm.file);
      attachments.push({
        name: reportForm.file.name,
        type: reportForm.file.type || "application/octet-stream",
        base64,
      });
    }

    const result = await createReport({
      title: reportForm.title,
      description: reportForm.description,
      category: reportForm.category,
      eventDate: reportForm.eventDate,
      attachments,
    });

    if (!result.ok) {
      setStatusMessage(result.message);
      setSaving(false);
      return;
    }

    setReportForm({ title: "", description: "", category: "general", eventDate: new Date().toISOString().slice(0, 10), file: null });
    setStatusMessage(`Отчёт сохранён: ${result.data.report.title}`);
    await refreshData();
    setSaving(false);
  }

  async function handleMeetingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");

    const attachments: ReportAttachment[] = [];

    if (meetingForm.file) {
      const base64 = await fileToBase64(meetingForm.file);
      attachments.push({
        name: meetingForm.file.name,
        type: meetingForm.file.type || "application/octet-stream",
        base64,
      });
    }

    const result = await createMeeting({
      title: meetingForm.title,
      description: meetingForm.description,
      category: "meeting",
      eventDate: meetingForm.eventDate,
      meetingFormat: meetingForm.meetingFormat,
      googleDocUrl: meetingForm.meetingFormat === "google-doc" ? meetingForm.googleDocUrl : undefined,
      attachments,
    });

    if (!result.ok) {
      setStatusMessage(result.message);
      setSaving(false);
      return;
    }

    setMeetingForm({
      title: "",
      description: "",
      meetingFormat: "text",
      googleDocUrl: "",
      eventDate: new Date().toISOString().slice(0, 10),
      file: null,
    });
    setStatusMessage(`Созвон сохранён: ${result.data.meeting.title}`);
    await refreshData();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="hub-page">
        <PageHeader
          eyebrow="Админка"
          title="Загрузка данных"
          description="Проверяем доступ и подгружаем рабочие списки."
        />
      </div>
    );
  }

  return (
    <AccessGate allowedRoles={["admin"]} title="Админская зона" description="Проверяем права администратора.">
      <div className="hub-page">
        <PageHeader
          eyebrow="Админка"
          title="Доступы, роли и отчёты"
          description="Здесь управляются разрешённые Gmail-адреса, роли сотрудников и файлы/отчёты."
          note={currentAccess ? `Вы вошли как ${currentAccess.identity.email}` : undefined}
        />
        <SectionNavigation items={sectionItems} />

        <section className="hub-panel section-anchor" id="access">
          <SectionTitle
            title="Выдача доступа"
            description="Админ добавляет Gmail, имя, роль и статус. Backend хранит allowlist и выдаёт доступ к данным."
            headingId="access-heading"
            focusable
          />
          <div className="hub-split">
            <form className="hub-form" onSubmit={handleEntrySubmit}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={entryForm.email}
                  onChange={(event) => setEntryForm({ ...entryForm, email: event.target.value })}
                  placeholder="name@gmail.com"
                  required
                />
              </label>
              <label>
                <span>Имя</span>
                <input
                  type="text"
                  value={entryForm.name}
                  onChange={(event) => setEntryForm({ ...entryForm, name: event.target.value })}
                  placeholder="Имя сотрудника"
                />
              </label>
              <label>
                <span>Роль</span>
                <select
                  value={entryForm.role}
                  onChange={(event) => setEntryForm({ ...entryForm, role: event.target.value as AccessEntry["role"] })}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Статус</span>
                <select
                  value={entryForm.status}
                  onChange={(event) => setEntryForm({ ...entryForm, status: event.target.value as AccessEntry["status"] })}
                >
                  <option value="active">Активен</option>
                  <option value="paused">Пауза</option>
                </select>
              </label>
              <button className="hub-action" type="submit" disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить доступ"}
              </button>
            </form>

            <div className="hub-list-grid">
              {accessEntries.map((entry) => (
                <article className="hub-card" key={entry.email}>
                  <div className="hub-card__top">
                    <h3>{entry.name || entry.email}</h3>
                    <span className="hub-badge">{entry.role}</span>
                  </div>
                  <p>{entry.email}</p>
                  <p className="hub-card__note">Статус: {entry.status === "active" ? "активен" : "пауза"}</p>
                  <div className="hub-actions">
                    <button className="hub-action hub-action--secondary" type="button" onClick={() => setEntryForm(entry)}>
                      Редактировать
                    </button>
                    <button className="hub-action hub-action--secondary" type="button" onClick={() => handleRemove(entry.email)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hub-panel section-anchor" id="meetings-upload">
          <SectionTitle
            title="История созвонов"
            description="Загружайте недельные созвоны сюда: дата, краткое содержание и, при необходимости, файл."
            headingId="meetings-upload-heading"
            focusable
          />
          <div className="hub-split">
            <form className="hub-form" onSubmit={handleMeetingSubmit}>
              <label>
                <span>Заголовок</span>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(event) => setMeetingForm({ ...meetingForm, title: event.target.value })}
                  placeholder="Созвон за неделю"
                  required
                />
              </label>
              <label>
                <span>Дата</span>
                <input
                  type="date"
                  value={meetingForm.eventDate}
                  onChange={(event) => setMeetingForm({ ...meetingForm, eventDate: event.target.value })}
                />
              </label>
              <label>
                <span>Формат</span>
                <select
                  value={meetingForm.meetingFormat}
                  onChange={(event) =>
                    setMeetingForm({ ...meetingForm, meetingFormat: event.target.value as MeetingFormat })
                  }
                >
                  <option value="text">Текстовый документ</option>
                  <option value="google-doc">Ссылка на Google Doc</option>
                </select>
              </label>
              {meetingForm.meetingFormat === "text" ? (
                <label>
                  <span>Текст созвона</span>
                  <textarea
                    value={meetingForm.description}
                    onChange={(event) => setMeetingForm({ ...meetingForm, description: event.target.value })}
                    placeholder="Решения, договорённости, риски"
                    rows={5}
                  />
                </label>
              ) : (
                <label>
                  <span>Ссылка на Google Doc</span>
                  <input
                    type="url"
                    value={meetingForm.googleDocUrl}
                    onChange={(event) => setMeetingForm({ ...meetingForm, googleDocUrl: event.target.value })}
                    placeholder="https://docs.google.com/document/d/..."
                    required
                  />
                </label>
              )}
              <label>
                <span>Файл</span>
                <input
                  type="file"
                  onChange={(event) => setMeetingForm({ ...meetingForm, file: event.target.files?.[0] ?? null })}
                />
              </label>
              <button className="hub-action" type="submit" disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить созвон"}
              </button>
            </form>

            <div className="hub-list-grid">
              {meetings.map((meeting) => (
                <article className="hub-card" key={meeting.id}>
                  <div className="hub-card__top">
                    <h3>{meeting.title}</h3>
                    <span className="hub-badge">{meeting.meetingFormat === "google-doc" ? "Google Doc" : "Текст"}</span>
                  </div>
                  {meeting.meetingFormat === "google-doc" ? (
                    <>
                      <p>{meeting.description || "Без описания"}</p>
                      <p className="hub-card__note">
                        {meeting.googleDocUrl ? (
                          <a href={meeting.googleDocUrl} target="_blank" rel="noreferrer">
                            Открыть Google Doc
                          </a>
                        ) : (
                          "Ссылка не указана"
                        )}
                      </p>
                    </>
                  ) : (
                    <p>{meeting.description || "Без описания"}</p>
                  )}
                  <p className="hub-card__note">
                    {meeting.eventDate} · {meeting.submittedBy.email}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hub-panel section-anchor" id="reports">
          <SectionTitle
            title="Отчёты и файлы"
            description="Сюда люди отправляют отчёты и прикрепляют файл. Вложения хранятся на сервере."
            headingId="reports-heading"
            focusable
          />
          <div className="hub-split">
            <form className="hub-form" onSubmit={handleReportSubmit}>
              <label>
                <span>Заголовок</span>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })}
                  placeholder="Отчёт за неделю"
                  required
                />
              </label>
              <label>
                <span>Категория</span>
                <select
                  value={reportForm.category}
                  onChange={(event) =>
                    setReportForm({ ...reportForm, category: event.target.value as ReportCategory })
                  }
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Дата</span>
                <input
                  type="date"
                  value={reportForm.eventDate}
                  onChange={(event) => setReportForm({ ...reportForm, eventDate: event.target.value })}
                />
              </label>
              <label>
                <span>Описание</span>
                <textarea
                  value={reportForm.description}
                  onChange={(event) => setReportForm({ ...reportForm, description: event.target.value })}
                  placeholder="Коротко опишите результат или проблему"
                  rows={5}
                />
              </label>
              <label>
                <span>Файл</span>
                <input
                  type="file"
                  onChange={(event) => setReportForm({ ...reportForm, file: event.target.files?.[0] ?? null })}
                />
              </label>
              <button className="hub-action" type="submit" disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить отчёт"}
              </button>
            </form>

            <div className="hub-list-grid">
              {reports.map((report) => (
                <article className="hub-card" key={report.id}>
                  <div className="hub-card__top">
                    <h3>{report.title}</h3>
                    <span className="hub-badge">{report.category}</span>
                  </div>
                  <p>{report.description || "Без описания"}</p>
                  <p className="hub-card__note">
                    {report.submittedBy.email} · {new Date(report.createdAt).toLocaleString("ru-RU")}
                  </p>
                  {report.attachments.length > 0 ? (
                    <ul className="hub-report-files">
                      {report.attachments.map((file) => (
                        <li key={file.id}>
                          {file.downloadUrl ? (
                            <a href={file.downloadUrl}>{file.originalName}</a>
                          ) : (
                            <span>{file.originalName}</span>
                          )}
                          <span>{formatFileSize(file.size)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hub-card__note">Без файла</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {statusMessage ? <NoticeCard title="Статус">{statusMessage}</NoticeCard> : null}
      </div>
    </AccessGate>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
