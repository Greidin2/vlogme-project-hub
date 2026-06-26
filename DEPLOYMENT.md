# Размещение Vlogme Project Hub

Деплой из этого проекта не выполняется автоматически.

## Сборка

```bash
npm run typecheck
npm run validate:resources
npm run build
```

Готовые статические файлы находятся в папке `dist`.

## Размещение

Содержимое `dist` можно загрузить на статический хостинг:

- в корень домена;
- в подпапку сайта;
- на поддомен.

Проект использует `HashRouter`, поэтому маршруты вида `#/content` работают без настройки серверных rewrite-правил.

## Cloudflare Access

Доступ к Hub должен ограничиваться через Cloudflare Access перед статическим сайтом. Настройте Self-hosted application, Identity Provider и Allow policy по точным рабочим email.

После загрузки проверьте:

- вход с разрешённой почты;
- отказ с неразрешённой почты;
- выход через `/cdn-cgi/access/logout`;
- отображение email в шапке;
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
