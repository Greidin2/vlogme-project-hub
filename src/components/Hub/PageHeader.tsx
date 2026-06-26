type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  note?: string;
};

export function PageHeader({ eyebrow, title, description, note }: PageHeaderProps) {
  return (
    <section className="page-card hub-page-header" aria-labelledby="page-title">
      {eyebrow ? <p className="hub-eyebrow">{eyebrow}</p> : null}
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
      {note ? <p className="hub-page-header__note">{note}</p> : null}
    </section>
  );
}
