# `@repo/typescript-config`

Общие `tsconfig` репозитория.

| Файл                 | Для чего                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| `base.json`          | База: ES2023, `strict`, bundler-резолв, `verbatimModuleSyntax`, `erasableSyntaxOnly` |
| `react-library.json` | base + DOM-либы + `jsx: react-jsx` — пакеты с React-компонентами                     |
| `vite-app.json`      | react-library + типы `vite/client` — приложения на Vite                              |
| `nextjs.json`        | react-library + `jsx: preserve` и плагин `next` — приложения на Next                 |
| `node.json`          | base + типы `node` — серверные пакеты и приложения                                   |

```json
{
  "extends": "@repo/typescript-config/vite-app.json",
  "include": ["src", "vite.config.ts"]
}
```

## Почему `module: preserve`, а не `nodenext`

Внутренние пакеты не собираются — они экспортируют `.ts`-исходники напрямую
(«just-in-time packages»), а компилирует их потребитель: Vite, `tsx` или `tsdown`.
При таком раскладе `preserve` + `moduleResolution: bundler` избавляет от
обязательных `.js`-расширений в относительных импортах, а `tsc` в пакетах
работает только как type-checker (`noEmit`).

## Про TypeScript 7

Репозиторий намеренно закреплён на TypeScript 6.0.x: `typescript-eslint` пока
объявляет peer `typescript <6.1.0`, то есть нативный TS 7 сломает линтер.
Как только появится совместимая версия — достаточно поднять `typescript` в
корне и пакетах.
