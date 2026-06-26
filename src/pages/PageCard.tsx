import "./PageCard.css";

type PageCardProps = {
  title: string;
};

export function PageCard({ title }: PageCardProps) {
  return (
    <section className="page-card" aria-labelledby="page-title">
      <span className="page-card__mark" aria-hidden="true" />
      <h1 id="page-title">{title}</h1>
      <p>Раздел готовится</p>
    </section>
  );
}
