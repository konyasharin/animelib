import pluginNext from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import { config as reactConfig } from './react.js';

/**
 * A custom ESLint configuration for Next.js applications.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = defineConfig([
  reactConfig,
  // перекрывает vite-вариант из react.js: в Next файлы легально экспортируют
  // metadata, generateStaticParams и прочие серверные значения
  pluginReactRefresh.configs.next,
  pluginNext.configs.recommended,
  pluginNext.configs['core-web-vitals'],
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
