# `web`

Next.js 16 (App Router, Turbopack). Приложение **само хостит API**: `appRouter`
из `@repo/server` смонтирован в route handler.

```sh
docker compose up -d && pnpm db:push   # один раз
pnpm dev --filter web                  # http://localhost:3002
```

## Как дотянуться до роутера

| Где                                | Как                                                                   |
| ---------------------------------- | --------------------------------------------------------------------- |
| server component                   | `createCallerFactory(appRouter)(createContext({}))` — вызов без HTTP |
| `src/app/api/trpc/[trpc]/route.ts` | `fetchRequestHandler` — HTTP для клиента                              |
| `'use client'`-компонент           | `trpc` из `src/trpc.ts` + `useQuery` / `useMutation`                  |

## Что нужно Next для внутренних пакетов

`transpilePackages` в `next.config.ts` — пакеты отдают `.ts`-исходники, Next по
умолчанию не компилирует код из `node_modules`.

Tailwind подключается через `@tailwindcss/postcss` (`postcss.config.mjs`);
`@source` в `globals.css` указывает на пакет компонентов.
