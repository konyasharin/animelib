# animelib

Личное веб-приложение для просмотра аниме. Монорепа: Turborepo + pnpm,
Next.js-приложение и общие пакеты (ESLint, TypeScript, Tailwind, компоненты,
tRPC-роутеры, Prisma).

## Стек

Turborepo 2 · pnpm workspaces · TypeScript 6 · ESLint 10 (flat config) ·
Prettier · husky · React 19 · Next.js 16 · Tailwind CSS 4 · tRPC 11 ·
TanStack Query 5 · Zod 4 · Prisma 7 + PostgreSQL

## Структура

```
apps/
  web/                   Next.js App Router, сам хостит tRPC                  :3002
packages/
  components/            React-компоненты, стили только Tailwind
  db/                    Prisma-схема, миграции, клиент
  eslint-config/         пресеты base / react / next / node
  server/                tRPC: контекст, процедуры, appRouter
  tailwind-config/       дизайн-токены Tailwind 4 (theme.css)
  typescript-config/     пресеты base / react-library / vite-app / nextjs / node
```

## Старт

```sh
pnpm install
cp .env.example .env   # DATABASE_URL от облачного Postgres
pnpm db:push           # схема → база
pnpm dev               # http://localhost:3002
```

Без облака поднимается локальный Postgres: `docker compose up -d` и
`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"`.

Все переменные — в одном `.env` в корне (`.env.example` рядом, сам `.env` в
`.gitignore`); как его подхватывают приложения, описано в
[`packages/db`](packages/db/README.md).

## Команды

```sh
pnpm dev --filter web
pnpm lint           # eslint --max-warnings 0 во всех пакетах
pnpm fix            # eslint --fix
pnpm check-types    # tsc --noEmit
pnpm build
pnpm db:migrate     # prisma migrate dev
pnpm db:studio
```

Хуки git (`.husky`): перед коммитом гоняются `check-types` → `fix` → `lint`,
`commit-msg` подставляет в сообщение имя ветки и эмодзи из
`git config user.emoji`.

## Новое приложение или пакет

```sh
pnpm gen app       # apps/<name>
pnpm gen package   # packages/<name> → @repo/<name>
```

Генераторы `turbo gen` (`turbo/generators/`) спрашивают имя, тип и порт,
раскладывают файлы и сразу зовут `pnpm install`. Типы приложений: Vite + React,
Next.js, и — если пакет `@repo/server` на месте — их же варианты с tRPC плюс
Node-API на standalone-адаптере. Пакеты: React-компоненты или Node-библиотека.

Всё сгенерированное сразу подключено к общим конфигам (`@repo/eslint-config`,
`@repo/typescript-config`, `@repo/tailwind-config`) и проходит `lint`,
`check-types` и `build` без правок. Версии зависимостей лежат в шаблонах
(`turbo/generators/templates/`) и обновляются руками — как и во всех
plop-генераторах.

## Как устроены зависимости

Внутренние пакеты **не собираются** — их `exports` указывают прямо на
`./src/index.ts`, а компилирует их потребитель (Vite, Next `transpilePackages`,
`tsx`, `tsdown`). Отсюда: нет `build` у пакетов, нет `dist`, нет рассинхрона
исходников и артефактов, а `check-types` в пакете — это `tsc --noEmit`.

Слои: `@repo/db` (данные) → `@repo/server` (API-логика) → приложение
(транспорт и UI). Тип `AppRouter` из `@repo/server` импортирует фронтенд —
это и даёт end-to-end типизацию без кодогенерации.

## Что добавить в новое приложение

1. `package.json` — зависимости `@repo/*` через `workspace:*`;
2. `eslint.config.js` → `@repo/eslint-config/react` (`/next`, `/node`);
3. `tsconfig.json` → `@repo/typescript-config/vite-app.json`
   (`nextjs.json`, `node.json`);
4. CSS → `@import 'tailwindcss'`, `@import '@repo/tailwind-config'`,
   `@source '../node_modules/@repo/components/src'`;
5. переменные окружения — в `turbo.json` (`env` / `globalEnv`), иначе линт
   предупредит через `turbo/no-undeclared-env-vars`.

Подробности — в README каждого пакета.
