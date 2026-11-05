import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  spinner,
  text,
} from '@clack/prompts';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));
const templates = path.join(root, 'scripts', 'templates', 'no-backend');

interface AppInfo {
  title: string;
  /** приложение бессмысленно без tRPC-роутеров и БД */
  needsBackend: boolean;
  /** для приложения есть облегчённый вариант без tRPC */
  standalone: boolean;
}

const APPS: Record<string, AppInfo> = {
  'web-app-example': {
    title: 'web-app-example — Vite + React SPA (:3000)',
    needsBackend: false,
    standalone: true,
  },
  'admin-app-example': {
    title: 'admin-app-example — вторая Vite-админка (:3001)',
    needsBackend: true,
    standalone: false,
  },
  'next-app-example': {
    title: 'next-app-example — Next.js App Router (:3002)',
    needsBackend: false,
    standalone: true,
  },
  'api-example': {
    title: 'api-example — Node-сервер на tRPC (:2022)',
    needsBackend: true,
    standalone: false,
  },
};

const BACKEND_PACKAGES = ['@repo/server', '@repo/db'];
const ALWAYS_KEEP = ['@repo/eslint-config', '@repo/typescript-config'];

const TRPC_DEPS = [
  '@repo/server',
  '@tanstack/react-query',
  '@trpc/client',
  '@trpc/server',
  '@trpc/tanstack-react-query',
];

const DESCRIPTIONS: Record<string, string> = {
  'apps/web-app-example':
    'Vite + React SPA: все пакеты сразу, tRPC-клиент      :3000',
  'apps/admin-app-example':
    'второе приложение на тех же пакетах, тёмная тема     :3001',
  'apps/next-app-example':
    'Next.js App Router, сам хостит tRPC                  :3002',
  'apps/api-example':
    'Node-сервер: standalone-адаптер для @repo/server     :2022',
  'packages/eslint-config': 'пресеты base / react / next / node',
  'packages/typescript-config':
    'пресеты base / react-library / vite-app / nextjs / node',
  'packages/tailwind-config': 'дизайн-токены Tailwind 4 (theme.css)',
  'packages/components': 'React-компоненты, стили только Tailwind',
  'packages/server': 'tRPC: контекст, процедуры, appRouter',
  'packages/db': 'Prisma-схема, миграции, клиент',
};

const STANDALONE_DESCRIPTIONS: Record<string, string> = {
  'web-app-example':
    'Vite + React SPA на общих пакетах                     :3000',
  'next-app-example':
    'Next.js App Router на общих пакетах                  :3002',
};

interface Manifest {
  name: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface TurboConfig {
  globalEnv?: string[];
  tasks: Record<string, { dependsOn?: string[]; env?: string[] }>;
}

interface Workspace {
  name: string;
  dir: string;
  relative: string;
  manifest: Manifest;
}

function appKey(workspace: Workspace) {
  return path.basename(workspace.relative);
}

async function readWorkspaces(group: 'apps' | 'packages') {
  const base = path.join(root, group);
  const entries = await readdir(base, { withFileTypes: true });
  const result: Workspace[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dir = path.join(base, entry.name);
    const manifestPath = path.join(dir, 'package.json');

    if (!existsSync(manifestPath)) continue;

    const manifest = JSON.parse(
      await readFile(manifestPath, 'utf8'),
    ) as Manifest;

    result.push({
      name: manifest.name,
      dir,
      relative: `${group}/${entry.name}`,
      manifest,
    });
  }

  return result;
}

function workspaceDeps(manifest: Manifest) {
  return Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
  }).filter(name => name.startsWith('@repo/'));
}

async function writeJson(file: string, value: unknown) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function editJson<T>(file: string, edit: (value: T) => void) {
  const value = JSON.parse(await readFile(file, 'utf8')) as T;

  edit(value);
  await writeJson(file, value);
}

async function dropEnvKeys(file: string, keys: string[]) {
  if (!existsSync(file)) return;

  const lines = (await readFile(file, 'utf8')).split('\n');
  const kept: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const matched = keys.some(key => line.startsWith(`${key}=`));

    if (!matched) {
      kept.push(line);
      continue;
    }

    // вместе со строкой убираем её комментарий сверху
    while (kept.at(-1)?.startsWith('#')) kept.pop();
    while (kept.at(-1) === '' && kept.length > 0) kept.pop();
    kept.push('');
  }

  await writeFile(
    file,
    `${kept
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()}\n`,
  );
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.turbo',
  '.next',
  'dist',
  'generated',
  'scripts',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.js',
  '.mjs',
  '.json',
  '.yaml',
  '.yml',
  '.md',
  '.html',
  '.css',
  '.prisma',
  '.example',
]);

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

/** Старые имена приложений упоминаются в README, скриптах и лок-файле. */
async function replaceEverywhere(replacements: Map<string, string>) {
  for await (const file of walk(root)) {
    const base = path.basename(file);

    if (!TEXT_EXTENSIONS.has(path.extname(file)) && !base.startsWith('.env')) {
      continue;
    }

    const content = await readFile(file, 'utf8');
    let next = content;

    for (const [from, to] of replacements) {
      next = next.split(from).join(to);
    }

    if (next !== content) await writeFile(file, next);
  }
}

async function rewriteReadmeStructure(kept: string[]) {
  const file = path.join(root, 'README.md');
  const readme = await readFile(file, 'utf8');
  const width = Math.max(...kept.map(item => path.basename(item).length)) + 6;

  const lines: string[] = [];

  for (const group of ['apps', 'packages']) {
    const inGroup = kept.filter(item => item.startsWith(`${group}/`));

    if (inGroup.length === 0) continue;

    lines.push(`${group}/`);

    for (const item of inGroup) {
      const label = `${path.basename(item)}/`.padEnd(width);

      lines.push(`  ${label}${DESCRIPTIONS[item] ?? ''}`.trimEnd());
    }
  }

  const next = readme.replace(
    /(## Структура\n\n```\n)[\s\S]*?(\n```)/,
    (_match, head: string, tail: string) => head + lines.join('\n') + tail,
  );

  await writeFile(file, next);
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  return result.status === 0;
}

const USAGE = `
pnpm pick [опции]

  --apps=a,b       оставить эти приложения (без промпта)
  --rename=a:b     переименовать приложение a в b (можно через запятую)
  --no-backend     удалить @repo/server, @repo/db и api-example
  --skip-install   не запускать pnpm install
  --keep-script    оставить сам scripts/pick.mts в репозитории
  -y, --yes        не переспрашивать
  -h, --help       эта справка
`;

const { values } = parseArgs({
  options: {
    apps: { type: 'string' },
    rename: { type: 'string' },
    'no-backend': { type: 'boolean', default: false },
    'skip-install': { type: 'boolean', default: false },
    'keep-script': { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false, short: 'y' },
    help: { type: 'boolean', default: false, short: 'h' },
  },
});

if (values.help) {
  console.log(USAGE.trim());
  process.exit(0);
}

intro('turborepo-core — выбор состава репозитория');

const apps = await readWorkspaces('apps');
const packages = await readWorkspaces('packages');
const available = apps.filter(app => appKey(app) in APPS);

if (available.length === 0) {
  cancel('Приложений-примеров не осталось — похоже, pick уже запускали');
  process.exit(1);
}

let keptAppDirs: string[];

if (values.apps !== undefined) {
  keptAppDirs = values.apps
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
} else {
  const answer = await multiselect({
    message: 'Какие приложения-примеры оставить?',
    required: false,
    options: available.map(app => ({
      value: appKey(app),
      label: APPS[appKey(app)]?.title ?? appKey(app),
    })),
    initialValues: available.map(appKey),
  });

  if (isCancel(answer)) {
    cancel('Отменено');
    process.exit(0);
  }

  keptAppDirs = answer as string[];
}

const unknown = keptAppDirs.filter(name => !(name in APPS));

if (unknown.length > 0) {
  cancel(`Неизвестные приложения: ${unknown.join(', ')}`);
  process.exit(1);
}

const backendForced = keptAppDirs.some(name => APPS[name]?.needsBackend);

if (backendForced && values['no-backend']) {
  cancel(
    'Выбранным приложениям бэкенд обязателен — уберите их или снимите --no-backend',
  );
  process.exit(1);
}

let keepBackend = true;

if (!backendForced) {
  if (values['no-backend'] || values.yes) {
    keepBackend = !values['no-backend'];
  } else {
    const answer = await confirm({
      message: 'Оставить бэкенд-часть (@repo/server + @repo/db + Prisma)?',
      initialValue: true,
    });

    if (isCancel(answer)) {
      cancel('Отменено');
      process.exit(0);
    }

    keepBackend = answer;
  }
}

const renames = new Map<string, string>();

if (values.rename !== undefined) {
  for (const pair of values.rename.split(',')) {
    const [from, to] = pair.split(':').map(item => item.trim());

    if (!from || !to) {
      cancel(`Не разобрал --rename: ${pair}`);
      process.exit(1);
    }

    renames.set(from, to);
  }
} else if (!values.yes) {
  for (const name of keptAppDirs) {
    const answer = await text({
      message: `Имя для ${name}`,
      placeholder: `${name} — Enter, чтобы оставить`,
    });

    if (isCancel(answer)) {
      cancel('Отменено');
      process.exit(0);
    }

    const next = typeof answer === 'string' ? answer.trim() : '';

    if (next && next !== name) renames.set(name, next);
  }
}

for (const [from, to] of renames) {
  if (!keptAppDirs.includes(from)) {
    cancel(`Нечего переименовывать: ${from} не в списке оставшихся`);
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(to)) {
    cancel(`Плохое имя: ${to} — нужен kebab-case`);
    process.exit(1);
  }

  if (keptAppDirs.includes(to) || existsSync(path.join(root, 'apps', to))) {
    cancel(`Имя ${to} уже занято`);
    process.exit(1);
  }
}

const removedApps = available.filter(app => !keptAppDirs.includes(appKey(app)));

// приложения без бэкенда переезжают на облегчённые шаблоны:
// из них уходят tRPC-клиент, провайдеры и route handler'ы
const strippedApps = keepBackend
  ? []
  : keptAppDirs.filter(name => APPS[name]?.standalone);

log.info(
  [
    `приложения: ${keptAppDirs.join(', ') || '— (только пакеты)'}`,
    `бэкенд: ${keepBackend ? 'остаётся' : 'удаляется'}`,
    strippedApps.length > 0
      ? `облегчаем без tRPC: ${strippedApps.join(', ')}`
      : undefined,
    renames.size > 0
      ? `переименования: ${[...renames]
          .map(([from, to]) => `${from} → ${to}`)
          .join(', ')}`
      : undefined,
  ]
    .filter(Boolean)
    .join('\n'),
);

if (!values.yes) {
  const answer = await confirm({
    message: 'Применить? Файлы удаляются без спроса.',
  });

  if (isCancel(answer) || !answer) {
    cancel('Отменено');
    process.exit(0);
  }
}

const progress = spinner();

progress.start('Перекраиваю репозиторий');

for (const name of strippedApps) {
  const dir = path.join(root, 'apps', name);
  const template = path.join(templates, name);

  if (existsSync(template)) {
    await cp(template, dir, { recursive: true, force: true });
  }

  for (const relative of [
    'src/trpc.ts',
    'src/app/providers.tsx',
    'src/app/todos.tsx',
    'src/app/api',
  ]) {
    await rm(path.join(dir, relative), { recursive: true, force: true });
  }

  await editJson<Manifest>(path.join(dir, 'package.json'), manifest => {
    for (const section of ['dependencies', 'devDependencies'] as const) {
      for (const dependency of TRPC_DEPS) {
        delete manifest[section]?.[dependency];
      }
    }
  });
}

for (const app of removedApps) {
  await rm(app.dir, { recursive: true, force: true });
}

// приложения, созданные через `pnpm gen`, не трогаем и учитываем их зависимости
const keptApps = apps.filter(
  app => keptAppDirs.includes(appKey(app)) || !(appKey(app) in APPS),
);
const byName = new Map(packages.map(item => [item.name, item]));
const required = new Set<string>(ALWAYS_KEEP);
const queue: string[] = [];

for (const app of keptApps) {
  const manifest = JSON.parse(
    await readFile(path.join(app.dir, 'package.json'), 'utf8'),
  );

  queue.push(...workspaceDeps(manifest));
}

while (queue.length > 0) {
  const name = queue.pop() as string;

  if (required.has(name)) continue;
  if (!keepBackend && BACKEND_PACKAGES.includes(name)) continue;

  required.add(name);

  const dependency = byName.get(name);

  if (dependency) queue.push(...workspaceDeps(dependency.manifest));
}

const removedPackages = packages.filter(item => !required.has(item.name));

for (const item of removedPackages) {
  await rm(item.dir, { recursive: true, force: true });
}

const viteAppsKept = keptAppDirs.some(name =>
  ['web-app-example', 'admin-app-example'].includes(name),
);
const removedEnv: string[] = [];

if (!keepBackend) {
  removedEnv.push('DATABASE_URL', 'DIRECT_DATABASE_URL');

  await rm(path.join(root, 'docker-compose.yml'), { force: true });

  await editJson<TurboConfig>(path.join(root, 'turbo.json'), config => {
    delete config.tasks.generate;

    for (const task of Object.values(config.tasks)) {
      if (!task.dependsOn) continue;

      task.dependsOn = task.dependsOn.filter(
        item => item !== '@repo/db#generate',
      );

      if (task.dependsOn.length === 0) delete task.dependsOn;
    }
  });
}

if (!keptAppDirs.includes('api-example')) {
  removedEnv.push('PORT');
}

// без бэкенда фронтенду некуда ходить — переменная теряет смысл
if (!viteAppsKept || !keepBackend) {
  removedEnv.push('VITE_API_URL');
}

if (removedEnv.length > 0) {
  for (const file of ['.env.example', '.env']) {
    await dropEnvKeys(path.join(root, file), removedEnv);
  }

  await editJson<TurboConfig>(path.join(root, 'turbo.json'), config => {
    const strip = (list?: string[]) =>
      list?.filter(name => !removedEnv.includes(name));

    config.globalEnv = strip(config.globalEnv);

    for (const task of Object.values(config.tasks)) {
      task.env = strip(task.env);

      if (task.env?.length === 0) delete task.env;
    }
  });
}

await editJson<Manifest>(path.join(root, 'package.json'), manifest => {
  const scripts = manifest.scripts ?? {};

  if (!keepBackend) {
    for (const script of Object.keys(scripts)) {
      if (script.startsWith('db:')) delete scripts[script];
    }
  }

  if (!values['keep-script']) {
    delete scripts.pick;
    delete manifest.devDependencies?.['@clack/prompts'];
    delete manifest.devDependencies?.tsx;
  }
});

if (!values['keep-script']) {
  await rm(path.join(root, 'scripts'), { recursive: true, force: true });
}

const envExample = path.join(root, '.env.example');
const envIsEmpty =
  existsSync(envExample) &&
  (await readFile(envExample, 'utf8'))
    .split('\n')
    .every(line => line.trim() === '' || line.startsWith('#'));

if (envIsEmpty) {
  await rm(envExample, { force: true });
  await rm(path.join(root, '.env'), { force: true });
}

{
  const file = path.join(root, 'README.md');
  let readme = await readFile(file, 'utf8');

  if (!keepBackend) {
    readme = readme
      .replace(/^pnpm db:.*\n/gm, '')
      .replace(/^Без облака поднимается[\s\S]*?\n\n/m, '')
      .replace(/ · tRPC 11 ·[\s\S]*?Prisma 7 \+ PostgreSQL/, '')
      .replace(
        /^Заготовка монорепы:[\s\S]*?\n\n/m,
        'Заготовка монорепы: Turborepo + pnpm, приложения-примеры и общие\nпакеты.\n\n',
      );
  }

  if (envIsEmpty) {
    readme = readme
      .replace(/^cp \.env\.example .*\n/gm, '')
      .replace(/^Все переменные — в одном[\s\S]*?\n\n/m, '');
  }

  await writeFile(file, readme);
}

for (const name of strippedApps) {
  DESCRIPTIONS[`apps/${name}`] = STANDALONE_DESCRIPTIONS[name] ?? '';
}

for (const [from, to] of renames) {
  await rename(path.join(root, 'apps', from), path.join(root, 'apps', to));

  DESCRIPTIONS[`apps/${to}`] = DESCRIPTIONS[`apps/${from}`] ?? '';
  delete DESCRIPTIONS[`apps/${from}`];
}

if (renames.size > 0) await replaceEverywhere(renames);

await rewriteReadmeStructure([
  ...keptApps.map(app => `apps/${renames.get(appKey(app)) ?? appKey(app)}`),
  ...packages
    .filter(item => required.has(item.name))
    .map(item => item.relative),
]);

progress.stop('Готово');

log.warn(
  [
    `удалены приложения: ${removedApps.map(app => app.relative).join(', ') || '—'}`,
    `удалены пакеты: ${removedPackages.map(item => item.relative).join(', ') || '—'}`,
  ].join('\n'),
);

if (!values['skip-install']) {
  if (!run('pnpm', ['install'])) {
    cancel('pnpm install упал — посмотрите вывод выше');
    process.exit(1);
  }
}

outro(
  'Дальше: pnpm lint && pnpm check-types, поправить README под свой проект и закоммитить.',
);
