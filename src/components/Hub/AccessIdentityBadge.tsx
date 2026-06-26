import { useEffect, useState } from "react";
import { getAccessIdentity, type AccessIdentityResult } from "../../services/accessIdentity";

export function AccessIdentityBadge() {
  const [identity, setIdentity] = useState<AccessIdentityResult>({ state: "local" });

  useEffect(() => {
    let isMounted = true;

    getAccessIdentity().then((result) => {
      if (isMounted) {
        setIdentity(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (identity.state === "local") {
    return <span className="hub-access-badge">Локальный режим</span>;
  }

  if (identity.state === "unavailable") {
    return <span className="hub-access-badge" title={identity.message}>Access недоступен</span>;
  }

  return (
    <div className="hub-access-badge">
      <span>Вы вошли как: {identity.identity.email}</span>
      <a href="/cdn-cgi/access/logout">Выйти</a>
    </div>
  );
}
