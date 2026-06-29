# Vlogme Project Hub

Внутренний портал команды Vlogme.ai. Он объединяет рабочие ссылки, инструкции, маршруты, контакты, админку доступа и backend для отчётов/вложений, но не заменяет Google Таблицы, Google Документы, Trello, Telegram, Vlogme.ai или Bug Tracker.

Проект не связан с боевым сервером Vlogme. Сервер и основной сайт Vlogme не изменяются.

## Технологии

- React
- Vite
- TypeScript
- React Router с `HashRouter`
- обычный CSS
- npm
- небольшой Node.js backend для allowlist, ролей и отчётов

## Команды

```bash
npm install
npm run dev
npm run typecheck
npm run validate:resources
npm run build
```

`npm run dev` запускает Vite и backend вместе.

Готовые статические файлы создаются в папке `dist`.

## Где менять данные

- Рабочие ссылки и статусы ресурсов: `src/config/resources.json`.
- Совместимый экспорт ресурсов: `src/config/links.ts`.
- Telegram placeholders: ресурсы `telegram-*` в `src/config/resources.json`.
- Контакты: ресурсы категории `contact` в `src/config/resources.json`.
- Объявления: `src/config/announcements.ts`.
- Данные проекта: `src/config/project.ts`.
- Название портала, версия, дата обновления, подвал и навигация: `src/config/site.ts`.
- API-адреса и маршруты: `src/config/api.ts` и `src/config/routes.ts`.

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

В интерфейсе есть отдельный раздел `Доступ`, где описана схема входа через Gmail, админская почта и порядок проверки разрешённых адресов.

Инструкция: `CLOUDFLARE_ACCESS_SETUP.md`.

## Backend

Backend хранит:

- allowlist email;
- роли пользователей;
- отчёты;
- прикреплённые файлы.

Данные сохраняются на сервере в папке `data/`, которая не должна коммититься.

Для работы backend в production задать:

- `CF_ACCESS_TEAM_DOMAIN` - например `https://<team>.cloudflareaccess.com`;
- `CF_ACCESS_AUDIENCE` - audience вашего Cloudflare Access приложения;
- `PORT` - порт backend;
- `DEV_ACCESS_EMAIL` - только для локальной проверки без Cloudflare.

Админка доступна по маршруту `/admin` и открывается только для роли `admin`.

## Перед публикацией

- Проверьте права доступа к Google-файлам и Trello.
- Проверьте все активные ссылки.
- Настройте Cloudflare Access и HTTPS на уровне хостинга.
- Убедитесь, что backend тоже находится за Cloudflare Access.
- Не добавляйте пароли, токены и секреты в проект.

## Автодеплой

На этой машине настроен локальный автодеплой: systemd timer периодически запускает `npm run deploy:prod`, который подтягивает `main` из GitHub, собирает `dist` и синхронизирует его с боевым каталогом. Mirror-копия живет в `/home/ubuntu/.cache/vlogme-project-hub-deploy`.

Если меняется способ публикации или путь к прод-каталогу, обновите `DEPLOYMENT.md` и скрипт `scripts/deploy-prod.mjs`.
