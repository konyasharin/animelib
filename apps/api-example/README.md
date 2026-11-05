# `api-example`

Транспорт для tRPC-роутеров из [`@repo/server`](../../packages/server): standalone
HTTP-сервер на Node.

```sh
pnpm dev --filter api-example   # http://localhost:2022
```

## Что здесь, а что в пакете

В приложении — всё, что связано с рантаймом: адаптер, порт, CORS, чтение
заголовков, graceful shutdown. Бизнес-логика и сам роутер — в `@repo/server`,
чтобы клиенты могли импортировать тип `AppRouter`.

```ts
createHTTPServer({
  router: appRouter,
  middleware: cors({ origin: true }),
  createContext: ({ req }) =>
    createContext({ authToken: req.headers.authorization }),
});
```

## Сборка

`tsdown` собирает один ESM-бандл в `dist/`. Внутренние пакеты не собираются
отдельно и отдают `.ts`, поэтому в `tsdown.config.ts` они помечены `noExternal`
— иначе в `dist` уехал бы `import '@repo/server'`, которого в рантайме нет.

```sh
pnpm build --filter api-example
node dist/index.mjs
```

В dev используется `tsx watch` — он же умеет исполнять TypeScript из workspace-пакетов.

Транзитивные зависимости (`pg`, сгенерированный Prisma-клиент) тоже попадают в
бандл: приложение их не объявляет, поэтому в рантайме их неоткуда резолвить.
Побочный плюс — `dist/index.mjs` самодостаточен, для образа хватит `node:alpine`
без `node_modules`.

## Проверка без клиента

```sh
curl 'http://localhost:2022/health.check'
curl 'http://localhost:2022/todos.list'
curl -X POST 'http://localhost:2022/todos.add' -H 'content-type: application/json' -d '{"title":"из curl"}'
curl -X POST 'http://localhost:2022/todos.clearCompleted' -H 'content-type: application/json' -H 'authorization: Bearer demo-token'
```
