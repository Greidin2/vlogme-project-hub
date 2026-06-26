import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { siteConfig } from "../../config/site";
import "./Navigation.css";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <nav className="navigation" aria-label="Основная навигация">
      <button
        className="navigation__toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        Меню
      </button>
      <ul className={isOpen ? "navigation__list navigation__list--open" : "navigation__list"} id="primary-navigation">
        {siteConfig.navigation.map((item) => (
          <li key={item.path}>
            <NavLink
              className={({ isActive }) => (isActive ? "navigation__link navigation__link--active" : "navigation__link")}
              end={item.path === "/"}
              to={item.path}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
