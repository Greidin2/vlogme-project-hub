import { useEffect, useMemo, useState } from "react";

export type SectionNavigationItem = {
  id: string;
  label: string;
};

type SectionNavigationProps = {
  items: SectionNavigationItem[];
};

export function SectionNavigation({ items }: SectionNavigationProps) {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((item): item is HTMLElement => Boolean(item));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  const handleClick = (id: string) => {
    const section = document.getElementById(id);

    if (!section) {
      if (import.meta.env.DEV) {
        console.warn(`[SectionNavigation] Section "${id}" was not found`);
      }
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    setActiveSection(id);

    const heading = section.querySelector<HTMLElement>("h2, h3");
    heading?.focus({ preventScroll: true });
  };

  return (
    <nav className="hub-quick-nav" aria-label="Навигация по странице">
      {items.map((item) => (
        <button
          aria-current={activeSection === item.id ? "location" : undefined}
          className={activeSection === item.id ? "hub-quick-nav__item hub-quick-nav__item--active" : "hub-quick-nav__item"}
          key={item.id}
          onClick={() => handleClick(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
