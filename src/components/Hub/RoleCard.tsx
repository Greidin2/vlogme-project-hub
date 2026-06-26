import { Link } from "react-router-dom";

type RoleCardProps = {
  title: string;
  description: string;
  to: string;
  buttonLabel: string;
};

export function RoleCard({ title, description, to, buttonLabel }: RoleCardProps) {
  return (
    <article className="hub-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="hub-action" to={to}>
        {buttonLabel}
      </Link>
    </article>
  );
}
