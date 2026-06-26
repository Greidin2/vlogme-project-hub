import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-card hub-page-header" aria-labelledby="page-title">
      <h1 id="page-title">Раздел не найден</h1>
      <p>Такого раздела в Project Hub нет. Вернитесь на главную страницу.</p>
      <Link className="hub-action" to="/">
        Вернуться на главную
      </Link>
    </section>
  );
}
