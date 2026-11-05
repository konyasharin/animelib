import type { PlopTypes } from '@turbo/gen';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

type AppType =
  | 'vite-react'
  | 'vite-react-trpc'
  | 'next'
  | 'next-trpc'
  | 'node-api';

interface AppAnswers {
  name: string;
  type: AppType;
  port: string;
}

interface PackageAnswers {
  name: string;
  type: 'react' | 'node';
}

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const TEMPLATES: Record<AppType, { template: string; withTrpc: boolean }> = {
  'vite-react': { template: 'app-vite-react', withTrpc: false },
  'vite-react-trpc': { template: 'app-vite-react', withTrpc: true },
  next: { template: 'app-next', withTrpc: false },
  'next-trpc': { template: 'app-next', withTrpc: true },
  'node-api': { template: 'app-node-api', withTrpc: true },
};

export default function generator(plop: PlopTypes.NodePlopAPI) {
  const root = plop.getDestBasePath();
  const hasServer = existsSync(path.join(root, 'packages', 'server'));

  const validateName = (group: 'apps' | 'packages') => (input: string) => {
    if (!NAME_PATTERN.test(input)) {
      return 'kebab-case: строчные буквы, цифры и дефис';
    }

    if (existsSync(path.join(root, group, input))) {
      return `${group}/${input} уже существует`;
    }

    return true;
  };

  const appChoices = [
    { name: 'Vite + React (SPA)', value: 'vite-react' },
    { name: 'Next.js (App Router)', value: 'next' },
    ...(hasServer
      ? [
          { name: 'Vite + React + tRPC-клиент', value: 'vite-react-trpc' },
          { name: 'Next.js + tRPC на сервере', value: 'next-trpc' },
          { name: 'Node + tRPC (API)', value: 'node-api' },
        ]
      : []),
  ];

  plop.setActionType('install', () => {
    execSync('pnpm install', { cwd: root, stdio: 'inherit' });

    return 'pnpm install';
  });

  plop.setGenerator('app', {
    description: 'Приложение в apps/ на общих пакетах репозитория',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Имя приложения (папка в apps/)',
        validate: validateName('apps'),
      },
      {
        type: 'list',
        name: 'type',
        message: 'Тип приложения',
        choices: appChoices,
      },
      {
        type: 'input',
        name: 'port',
        message: 'Порт для dev-сервера',
        default: (answers: AppAnswers) =>
          answers.type === 'node-api' ? '2023' : '3010',
      },
    ],
    actions: answers => {
      const { type } = answers as AppAnswers;
      const preset = TEMPLATES[type];

      if (!preset) {
        throw new Error(`Неизвестный тип приложения: ${type}`);
      }

      const templateFiles = [`templates/${preset.template}/**`];

      if (!preset.withTrpc) {
        templateFiles.push(`!templates/${preset.template}/src/trpc.ts.hbs`);
      }

      return [
        {
          type: 'addMany',
          destination: '{{ turbo.paths.root }}/apps/{{ name }}',
          base: `templates/${preset.template}`,
          templateFiles,
          data: { withTrpc: preset.withTrpc },
        },
        { type: 'install' },
      ];
    },
  });

  plop.setGenerator('package', {
    description: 'Внутренний пакет в packages/',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Имя пакета (станет @repo/<name>)',
        validate: validateName('packages'),
      },
      {
        type: 'list',
        name: 'type',
        message: 'Тип пакета',
        choices: [
          { name: 'React-компоненты', value: 'react' },
          { name: 'Node / изоморфная библиотека', value: 'node' },
        ],
      },
    ],
    actions: answers => {
      const { type } = answers as PackageAnswers;

      return [
        {
          type: 'addMany',
          destination: '{{ turbo.paths.root }}/packages/{{ name }}',
          base: `templates/package-${type}`,
          templateFiles: `templates/package-${type}/**`,
        },
        { type: 'install' },
      ];
    },
  });
}
