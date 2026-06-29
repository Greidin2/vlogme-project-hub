# Размещение Vlogme Project Hub

Деплой из этого проекта не выполняется автоматически.

## Сборка

```bash
npm run typecheck
npm run validate:resources
npm run build
```

Готовые статические файлы находятся в папке `dist`.

Если используется backend для allowlist, ролей и отчётов, его нужно запускать отдельно или рядом со статикой. Backend стартует командой `npm run start`.

## Размещение

Содержимое `dist` можно загрузить на статический хостинг:

- в корень домена;
- в подпапку сайта;
- на поддомен.

Проект использует `HashRouter`, поэтому маршруты вида `#/content` работают без настройки серверных rewrite-правил.

## Автообновление на этой машине

Для этого сервера настроен локальный deploy-скрипт, который:

1. Берет свежий `main` из GitHub по SSH deploy key.
2. Собирает приложение в отдельной рабочей копии.
3. Синхронизирует готовый `dist` в боевой каталог `/var/www/vlogme-project-hub/dist`.

Скрипт запускается командой:

```bash
npm run deploy:prod
```

Для постоянного автообновления используется systemd timer, который вызывает тот же скрипт по расписанию. Это не требует ручного пуша на сервер и не зависит от текущего состояния рабочей копии репозитория. Рабочая mirror-копия хранится в `/home/ubuntu/.cache/vlogme-project-hub-deploy`.

## Cloudflare Access

Доступ к Hub должен ограничиваться через Cloudflare Access перед статическим сайтом. Настройте Self-hosted application, Identity Provider и Allow policy по точным рабочим email.

Для backend используйте тот же слой защиты Cloudflare Access и задайте:

- `CF_ACCESS_TEAM_DOMAIN`;
- `CF_ACCESS_AUDIENCE`;
- `PORT`;
- `DEV_ACCESS_EMAIL` только для локальной проверки.

После загрузки проверьте:

- вход с разрешённой почты;
- отказ с неразрешённой почты;
- выход через `/cdn-cgi/access/logout`;
- отображение email в шапке;
- раздел `Доступ` в интерфейсе;
- `/admin` для роли `admin`;
- загрузку отчётов и файлов;
- работу локальной версии без Cloudflare.

## HTTPS и безопасность

Для рабочего использования нужен HTTPS.

Рекомендуемые заголовки на уровне хоста:

```text
Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Не применяйте эти примеры автоматически без проверки на реальном хостинге.

## Перед заменой версии

Сделайте резервную копию предыдущей папки `dist` на хостинге.

После загрузки проверьте все ссылки, PDF, Telegram, email, Google-файлы и Trello уже на опубликованном адресе.

Нельзя безопасно хранить пароль внутри React-приложения. Не добавляйте в этот файл реальные серверные пароли, IP-адреса или пользовательские пути.
