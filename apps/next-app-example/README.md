# `next-app-example`

Next.js 16 (App Router, Turbopack). В отличие от `web-app-example`, приложение
**само хостит API**: тот же `appRouter` из `@repo/server` смонтирован в route
handler.

```sh
docker compose up -d && pnpm db:push   # один раз
pnpm dev --filter next-app-example     # http://localhost:3002
```

## Три способа дотянуться до одного роутера

| Где                                   | Как                                            |
| ------------------------------------- | ---------------------------------------------- |
| `src/app/page.tsx` (server component) | `createCallerFactory` — прямой вызов, без HTTP |
| `src/app/api/trpc/[trpc]/route.ts`    | `fetchRequestHandler` — HTTP для клиента       |
| `src/app/todos.tsx` (`'use client'`)  | обычный tRPC-клиент на `/api/trpc`             |

Это и есть смысл выноса роутеров в пакет: рантайм разный, роутер один.

## Что нужно Next для внутренних пакетов

`transpilePackages` в `next.config.ts` — пакеты отдают `.ts`-исходники, Next по
умолчанию не компилирует код из `node_modules`.

Tailwind подключается через `@tailwindcss/postcss` (`postcss.config.mjs`), а не
через Vite-плагин; `@source` в `globals.css` указывает на пакет компонентов.
