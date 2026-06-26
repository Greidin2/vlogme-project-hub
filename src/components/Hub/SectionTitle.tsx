type SectionTitleProps = {
  title: string;
  description?: string;
  headingId?: string;
  focusable?: boolean;
};

export function SectionTitle({ title, description, headingId, focusable = false }: SectionTitleProps) {
  return (
    <div className="hub-section-title">
      <h2 id={headingId} tabIndex={focusable ? -1 : undefined}>
        {title}
      </h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
