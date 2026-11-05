# `@repo/server`

tRPC-роутеры и контекст. Пакет содержит **только бизнес-логику API** — здесь нет
HTTP-сервера, портов и адаптеров.

## Почему пакет, а не «всё внутри приложения»

Транспорт (адаптер, порт, CORS) — забота приложения: в `apps/web` это route
handler `/api/trpc`. А сам роутер вынесен в пакет, потому что:

- тип `AppRouter` нужен клиентам — так работает end-to-end типизация tRPC без
  кодогенерации;
- один и тот же роутер можно поднять разными адаптерами (standalone, fastify,
  serverless) или дёрнуть напрямую через `createCallerFactory` в тестах;
- граница «логика ↔ транспорт» не даёт роутерам зависеть от `req`/`res`.

Если у API один-единственный потребитель и он же его хостит — держать роутеры
прямо в приложении нормально. Как только появляется второй клиент или второй
рантайм, начинается копипаста типов, поэтому здесь сразу пакет.

## Структура

```
src/trpc.ts            initTRPC, контекст, publicProcedure
src/routers/health.ts  health.check
src/router.ts          appRouter, тип AppRouter
```

## База данных

Роутеры ходят в PostgreSQL через [`@repo/db`](../db) (Prisma 7). Отдельный
пакет, а не `PrismaClient` прямо здесь: схема и миграции живут своей жизнью,
а `@repo/server` остаётся слоем API. Перед первым запуском нужен
`docker compose up -d && pnpm db:push`.

## Контекст

Пакет не знает про Node-запрос: приложение само достаёт нужное из транспорта.

```ts
createContext({ authToken: req.headers.authorization });
```

## Прямой вызов без HTTP (тесты, скрипты)

```ts
import { appRouter, createCallerFactory, createContext } from '@repo/server';

const caller = createCallerFactory(appRouter)(
  createContext({}),
);
await caller.health.check();
```
