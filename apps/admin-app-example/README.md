# `admin-app-example`

Второе Vite-приложение. Нужно, чтобы показать главное свойство монорепы: те же
пакеты собираются в другое приложение без единой строчки условной логики
(`if (app === 'admin')`) — просто другой набор экранов.

```sh
pnpm dev --filter admin-app-example   # http://localhost:3001
```

Отличия от `web-app-example`:

- тёмная тема включена статически — `<html class="dark">`, вариант `dark:`
  объявлен в `@repo/tailwind-config` через класс, а не media-query;
- клиент tRPC шлёт заголовок `Authorization`, поэтому доступна
  protected-процедура `todos.clearCompleted`;
- свой набор компонентов из `@repo/components` — без формы и без списка.
