type QuickNavProps = {
  items?: Array<{
    href: string;
    label: string;
  }>;
};

const defaultItems = [
  { href: "#tools", label: "Инструменты" },
  { href: "#workflow", label: "Маршрут" },
  { href: "#rules", label: "Правила" },
  { href: "#help", label: "Помощь" },
];

export function QuickNav({ items = defaultItems }: QuickNavProps) {
  return (
    <nav className="hub-quick-nav" aria-label="Навигация по странице">
      {items.map((item) => (
        <a href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
