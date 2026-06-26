import { Outlet } from "react-router-dom";
import { Header } from "../Header/Header";
import { siteConfig } from "../../config/site";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <div>{siteConfig.footerText}</div>
        <div>{siteConfig.footerNote}</div>
        <div>
          Версия {siteConfig.version} · обновлено {siteConfig.lastUpdated}
        </div>
      </footer>
    </div>
  );
}
