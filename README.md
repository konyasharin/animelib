# turborepo-core

Заготовка монорепы: Turborepo + pnpm, четыре приложения-примера и общие пакеты
(ESLint, TypeScript, Tailwind, компоненты, tRPC-роутеры, Prisma).

## Стек

Turborepo 2 · pnpm workspaces · TypeScript 6 · ESLint 10 (flat config) ·
Prettier · husky · Vite 8 · React 19 · Next.js 16 · Tailwind CSS 4 · tRPC 11 ·
TanStack Query 5 · Zod 4 · Prisma 7 + PostgreSQL

## Структура

```
apps/
  web-app-example/     Vite + React SPA: все пакеты сразу, tRPC-клиент      :3000
  admin-app-example/   второе приложение на тех же пакетах, тёмная тема     :3001
  next-app-example/    Next.js App Router, сам хостит tRPC                  :3002
  api-example/         Node-сервер: standalone-адаптер для @repo/server     :2022
packages/
  eslint-config/       пресеты base / react / next / node
  typescript-config/   пресеты base / react-library / vite-app / nextjs / node
  tailwind-config/     дизайн-токены Tailwind 4 (theme.css)
  components/          React-компоненты, стили только Tailwind
  server/              tRPC: контекст, процедуры, appRouter
  db/                  Prisma-схема, миграции, клиент
```

## Старт

```sh
pnpm install
cp .env.example .env   # DATABASE_URL от облачного Postgres
pnpm db:push           # схема → база
pnpm db:seed           # демо-данные
pnpm dev               # все приложения разом
```

Без облака поднимается локальный Postgres: `docker compose up -d` и
`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"`.

Все переменные — в одном `.env` в корне (`.env.example` рядом, сам `.env` в
`.gitignore`); как его подхватывают приложения, описано в
[`packages/db`](packages/db/README.md).

## Команды

```sh
pnpm dev --filter web-app-example
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

## Урезать репозиторий под конкретный проект

```sh
pnpm pick                                                        # интерактивно
pnpm pick --apps=web-app-example --rename=web-app-example:web -y # без вопросов
```

Скрипт спрашивает, какие приложения-примеры оставить и как их назвать
(Enter — оставить имя как есть), после чего удаляет всё остальное:
неиспользуемые пакеты (граф зависимостей считается сам), задачи `db:*`,
`docker-compose.yml`, лишние переменные в `.env.example` и `turbo.json`, блок
«Структура» в этом README. Если бэкенд не нужен, `web-app-example` и
`next-app-example` переезжают на облегчённые версии без tRPC —
`admin-app-example` и `api-example` без него не предлагаются вовсе.

Переименование меняет не только папку и `name` в `package.json`: старое имя
вычищается из README, конфигов и лок-файла по всему репозиторию.

После работы скрипт удаляет сам себя (`--keep-script` оставит). Флаги:
`--apps`, `--rename=a:b`, `--no-backend`, `--skip-install`, `--keep-script`,
`-y`, `-h`.
README после урезания стоит перечитать: структура и команды поправятся, а
описания разделов — нет.

## Как устроены зависимости

Внутренние пакеты **не собираются** — их `exports` указывают прямо на
`./src/index.ts`, а компилирует их потребитель (Vite, Next `transpilePackages`,
`tsx`, `tsdown`). Отсюда: нет `build` у пакетов, нет `dist`, нет рассинхрона
исходников и артефактов, а `check-types` в пакете — это `tsc --noEmit`.

Слои: `@repo/db` (данные) → `@repo/server` (API-логика) → приложение
(транспорт и UI). Тип `AppRouter` из `@repo/server` импортируют все три
фронтенда — это и даёт end-to-end типизацию без кодогенерации.

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
