import { announcements, type AnnouncementType } from "../../config/announcements";

const labels: Record<AnnouncementType, string> = {
  info: "Информация",
  warning: "Обратите внимание",
  important: "Важно",
};

export function AnnouncementList() {
  return (
    <div className="hub-list-grid">
      {announcements.slice(0, 3).map((announcement) => (
        <article className="hub-card" key={announcement.id}>
          <span className="hub-badge">{labels[announcement.type]}</span>
          <p>{announcement.text}</p>
        </article>
      ))}
    </div>
  );
}
