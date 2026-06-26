export type NavigationItem = {
  label: string;
  path: string;
};

export const siteConfig = {
  title: "Vlogme Project Hub",
  description: "Внутренний рабочий портал команды Vlogme.ai",
  footerText: "Vlogme Project Hub — внутренний портал команды",
  footerNote: "Рабочие процессы выполняются во внешних сервисах",
  version: "1.1",
  lastUpdated: "26.06.2026",
  navigation: [
    { label: "Главная", path: "/" },
    { label: "Контент", path: "/content" },
    { label: "Публикация", path: "/publication" },
    { label: "Маркетинг", path: "/marketing" },
    { label: "Помощь", path: "/help" },
  ] satisfies NavigationItem[],
};
