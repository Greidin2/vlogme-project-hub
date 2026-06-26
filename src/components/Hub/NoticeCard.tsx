import type { ReactNode } from "react";

type NoticeCardProps = {
  title?: string;
  children: ReactNode;
};

export function NoticeCard({ title, children }: NoticeCardProps) {
  return (
    <section className="hub-notice">
      {title ? <h3>{title}</h3> : null}
      <div>{children}</div>
    </section>
  );
}
