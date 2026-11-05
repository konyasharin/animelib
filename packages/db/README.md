# `@repo/db`

Prisma 7 + PostgreSQL: схема, миграции и единственный экземпляр `PrismaClient`.
Пакет не знает ни про tRPC, ни про HTTP — только доступ к данным.

## Быстрый старт

```sh
cp .env.example .env           # в корне репозитория, вписать облачный Postgres
pnpm db:push                   # схема → база (или pnpm db:migrate для миграций)
pnpm db:seed                   # пара задач для примера
```

## Переменные окружения

Один `.env` на всю монорепу — в корне репозитория, в git не попадает
(`.gitignore`), рядом лежит `.env.example`.

| Переменная            | Кто читает                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`        | рантайм приложения — строка через пулер, если он есть                                                        |
| `DIRECT_DATABASE_URL` | prisma CLI: pgbouncer и другие пулеры не умеют DDL, миграции идут напрямую. Пусто — возьмётся `DATABASE_URL` |

Кто как подтягивает корневой `.env`: `prisma.config.ts` и `next.config.ts` — через
`dotenv`, Vite-приложения — через `envDir: '../..'`, `api-example` — флагом
`node --env-file-if-exists`. Обе переменные объявлены в `globalEnv` в
`turbo.json`, иначе линт ругнётся `turbo/no-undeclared-env-vars`.

Для локальной разработки без облака в корне есть `docker-compose.yml`
(`docker compose up -d`, строка `postgresql://postgres:postgres@localhost:5432/app`).

## Особенности Prisma 7

- генератор `prisma-client` (не `prisma-client-js`) с обязательным `output` —
  клиент генерируется в `generated/prisma` **TypeScript-исходниками** и лежит
  вне `src`, поэтому не попадает под линт и `tsc`;
- URL базы больше не хранится в `schema.prisma`, а задаётся в `prisma.config.ts`;
- рантайм требует драйвер-адаптер: здесь `@prisma/adapter-pg` поверх `pg`.
  Смена СУБД = другой адаптер + `provider` в схеме;
- `generate` объявлен задачей turbo (`outputs: generated/**`), а `build`,
  `lint` и `check-types` зависят от `@repo/db#generate` — клиент всегда
  сгенерирован до сборки и кэшируется turbo.

## Клиент

```ts
import { prisma } from '@repo/db';
```

Экземпляр создаётся **при первом обращении**, а не при импорте модуля: иначе
`next build`, который импортирует роутеры, падал бы без боевого `DATABASE_URL`.
Сам экземпляр кладётся в `globalThis` — dev-серверы перезагружают модули, и без
этого каждый reload открывал бы новый пул соединений.
