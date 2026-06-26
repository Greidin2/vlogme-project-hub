import { siteConfig } from "../../config/site";
import { AccessIdentityBadge } from "../Hub/AccessIdentityBadge";
import { Navigation } from "../Navigation/Navigation";
import "./Header.css";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#/" aria-label="Vlogme Project Hub, главная">
          {siteConfig.title}
        </a>
        <Navigation />
        <AccessIdentityBadge />
      </div>
    </header>
  );
}
