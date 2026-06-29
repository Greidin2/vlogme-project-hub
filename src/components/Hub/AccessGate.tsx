import { useEffect, useState, type ReactNode } from "react";
import { getCurrentAccess, type AccessRoleId, type CurrentAccess } from "../../services/adminApi";
import { NoticeCard } from "./NoticeCard";

type AccessGateProps = {
  allowedRoles: AccessRoleId[];
  children: ReactNode;
  title?: string;
  description?: string;
};

type AccessState =
  | { state: "loading" }
  | { state: "allowed"; access: CurrentAccess }
  | { state: "denied"; message: string };

const roleLabels: Record<AccessRoleId, string> = {
  admin: "Админ",
  "content-manager": "Контент-менеджер",
  "platform-lead": "Platform Lead",
  marketing: "Маркетинг",
  viewer: "Просмотр",
};

export function AccessGate({ allowedRoles, children, title, description }: AccessGateProps) {
  const [accessState, setAccessState] = useState<AccessState>({ state: "loading" });
  const allowedRoleKey = allowedRoles.join("|");

  useEffect(() => {
    let alive = true;

    getCurrentAccess().then((result) => {
      if (!alive) {
        return;
      }

      if (!result.ok) {
        setAccessState({
          state: "denied",
          message: result.status === 401
            ? "Нужен вход через Cloudflare Access."
            : result.message,
        });
        return;
      }

      if (!allowedRoles.includes(result.data.role)) {
        setAccessState({
          state: "denied",
          message: `Доступ ограничен для роли ${roleLabels[result.data.role] ?? result.data.role}.`,
        });
        return;
      }

      setAccessState({ state: "allowed", access: result.data });
    });

    return () => {
      alive = false;
    };
  }, [allowedRoleKey]);

  if (accessState.state === "loading") {
    return (
      <NoticeCard title={title ?? "Проверка доступа"}>
        <p>{description ?? "Проверяем текущую учётную запись."}</p>
      </NoticeCard>
    );
  }

  if (accessState.state === "denied") {
    return (
      <NoticeCard title={title ?? "Доступ ограничен"}>
        <p>{accessState.message}</p>
      </NoticeCard>
    );
  }

  return <>{children}</>;
}
