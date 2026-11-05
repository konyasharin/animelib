# `web-app-example`

Vite + React 19 SPA, показывает подключение всех внутренних пакетов сразу.

```sh
pnpm dev --filter web-app-example   # http://localhost:3000
```

Для данных нужен запущенный `api-example` (`pnpm dev` в корне поднимает оба).

## Что здесь показано

| Пакет                     | Где смотреть                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `@repo/tailwind-config`   | `src/index.css` — `@import` темы + `@source` для пакета компонентов                   |
| `@repo/components`        | `src/app.tsx` — `Button`, `Card`, `Input`, `Badge`                                    |
| `@repo/server`            | `src/trpc.ts` — импорт **только типа** `AppRouter`, поэтому пакет в `devDependencies` |
| `@repo/eslint-config`     | `eslint.config.js` — пресет `react`                                                   |
| `@repo/typescript-config` | `tsconfig.json` — пресет `vite-app.json`                                              |

## tRPC без провайдера

SPA не нужен `TRPCProvider`: клиент и `QueryClient` создаются один раз в
`src/trpc.ts` (`createTRPCOptionsProxy`), а компоненты дергают
`useQuery(trpc.todos.list.queryOptions())`. Инвалидация — через
`queryClient.invalidateQueries(trpc.todos.pathFilter())` (`pathFilter` — на
уровне роутера, `queryFilter` — на уровне процедуры).

## Переменные окружения

`VITE_API_URL` — адрес tRPC-сервера, по умолчанию `http://localhost:2022`.
Переменные, которые читает приложение, перечислены в `turbo.json` (`env`), иначе
`turbo/no-undeclared-env-vars` ругнётся на этапе линта.
