export type AnnouncementType = "info" | "warning" | "important";

export type Announcement = {
  id: string;
  type: AnnouncementType;
  text: string;
};

export const announcements: Announcement[] = [
  {
    id: "actual-guides",
    type: "info",
    text: "Используйте только актуальные инструкции из Project Hub.",
  },
  {
    id: "work-process-contact",
    type: "warning",
    text: "По вопросам таблиц, Trello, документов и рабочих процессов обращайтесь к @greidin.",
  },
  {
    id: "technical-errors",
    type: "important",
    text: "Технические ошибки оформляются через Bug Tracker.",
  },
];
