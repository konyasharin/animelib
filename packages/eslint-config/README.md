# `@repo/eslint-config`

Общие ESLint-конфигурации репозитория (flat config, ESLint 10).

## Пресеты

| Импорт                      | Для чего                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `@repo/eslint-config/base`  | Базовый: JS + TypeScript + prettier + simple-import-sort + turbo  |
| `@repo/eslint-config/react` | React-приложения и библиотеки (react, react-hooks, react-refresh) |
| `@repo/eslint-config/node`  | Серверные пакеты (tRPC/Node)                                      |
| `@repo/eslint-config/next`  | Next.js-приложения (react + плагин @next/next)                    |

`react` и `node` наследуют `base`, `next` наследует `react`.

## Использование

```js
// eslint.config.js в пакете
import { config } from '@repo/eslint-config/react';

/** @type {import("eslint").Linter.Config[]} */
export default config;
```

С доп. настройками:

```js
import { config as reactConfig } from '@repo/eslint-config/react';
import { defineConfig } from 'eslint/config';

export default defineConfig([reactConfig, { ignores: ['**/*.gen.ts'] }]);
```

В `package.json` пакета:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "fix": "eslint . --fix"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "eslint": "^10.8.0"
  }
}
```

## Заметки

- `eslint-plugin-only-warn` понижает все ошибки до warning'ов, поэтому линт запускается
  с `--max-warnings 0` — иначе падений не будет.
- Форматирование проверяется через `prettier/prettier`; настройки берутся из
  корневого `.prettierrc`.
