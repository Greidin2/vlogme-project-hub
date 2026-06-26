# PDF-инструкции

В эту папку администратор кладёт PDF-инструкции для Project Hub.

Найдены и подключены:

- `content-manager-guide.pdf` — инструкция контент-менеджера.
- `marketing-guide.pdf` — инструкция маркетинга.
- `bug-tracker-guide.pdf` — полная инструкция Bug Tracker.

Ожидаются:

- `platform-lead-guide.pdf` — инструкция Platform Lead.

Дополнительно добавлена краткая памятка:

- `bug-tracker-quick-memo.pdf`

После добавления отсутствующего PDF нужно открыть `src/config/resources.json`, найти соответствующий ресурс и изменить статус с `missing` на `local`. Добавьте поле `url`:

- `./docs/platform-lead-guide.pdf`

После изменения выполните:

```bash
npm run typecheck
npm run validate:resources
npm run build
```
