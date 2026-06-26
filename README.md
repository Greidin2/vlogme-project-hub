# Vlogme Project Hub

Статический внутренний портал команды Vlogme.ai. Он объединяет рабочие ссылки, инструкции, маршруты и контакты, но не заменяет Google Таблицы, Google Документы, Trello, Telegram, Vlogme.ai или Bug Tracker.

Проект не связан с боевым сервером Vlogme. Сервер и основной сайт Vlogme не изменяются.

## Технологии

- React
- Vite
- TypeScript
- React Router с `HashRouter`
- обычный CSS
- npm

## Команды

```bash
npm install
npm run dev
npm run typecheck
npm run validate:resources
npm run build
```

Готовые статические файлы создаются в папке `dist`.

## Где менять данные

- Рабочие ссылки и статусы ресурсов: `src/config/resources.json`.
- Совместимый экспорт ресурсов: `src/config/links.ts`.
- Telegram placeholders: ресурсы `telegram-*` в `src/config/resources.json`.
- Контакты: ресурсы категории `contact` в `src/config/resources.json`.
- Объявления: `src/config/announcements.ts`.
- Данные проекта: `src/config/project.ts`.
- Название портала, версия, дата обновления, подвал и навигация: `src/config/site.ts`.

Все URL должны храниться только в `src/config`.

## Статусы ресурсов

- `ready` — ссылка активна.
- `individual` — ссылка выдаётся сотруднику отдельно.
- `missing` — ссылка пока не добавлена.
- `local` — локальный PDF из `public/docs`.

Для `missing` и `individual` не указывайте `url`.

## PDF

PDF хранятся в `public/docs`. Сейчас добавлены:

- `content-manager-guide.pdf`
- `marketing-guide.pdf`

Ожидаются:

- `platform-lead-guide.pdf`
- `bug-tracker-guide.pdf`

После добавления PDF поменяйте статус ресурса в `src/config/resources.json` на `local`, добавьте `url` вида `./docs/name.pdf` и выполните проверки.

## Cloudflare Access

Реальная авторизация должна быть настроена перед статическим сайтом через Cloudflare Access. React только получает данные вошедшего пользователя через `/cdn-cgi/access/get-identity`, показывает email и ссылку выхода `/cdn-cgi/access/logout`.

React не содержит форму email/пароль, не хранит allowlist и не является средством защиты доступа. В локальной разработке Hub работает без Cloudflare и показывает метку `Локальный режим`.

Инструкция: `CLOUDFLARE_ACCESS_SETUP.md`.

## Перед публикацией

- Проверьте права доступа к Google-файлам и Trello.
- Проверьте все активные ссылки.
- Настройте Cloudflare Access и HTTPS на уровне хостинга.
- Не добавляйте пароли, токены и секреты в проект.
