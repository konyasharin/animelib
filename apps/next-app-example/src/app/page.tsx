import { Badge } from '@repo/components';
import { appRouter, createCallerFactory, createContext } from '@repo/server';

import { Todos } from './todos';

export const dynamic = 'force-dynamic';

// серверный компонент дергает роутер напрямую, без HTTP — тот же appRouter,
// что и в route handler'е, и в apps/api-example
const caller = createCallerFactory(appRouter)(createContext({}));

export default async function Page() {
  const todos = await caller.todos.list();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">next-app-example</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            App Router + @repo/components + tRPC внутри самого приложения
          </p>
        </div>
        <Badge tone="brand">next 16</Badge>
      </header>

      <Todos initialCount={todos.length} />
    </main>
  );
}
