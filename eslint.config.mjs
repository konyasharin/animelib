import { config } from '@repo/eslint-config/node';
import { defineConfig, globalIgnores } from 'eslint/config';

// в корне линтуются только скрипты и генераторы: apps/* и packages/*
// проверяются своими конфигами через turbo
/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  globalIgnores(['apps/**', 'packages/**', '**/templates/**']),
  config,
]);
