import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trpc } from './trpc';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control bg-neutral-100 dark:bg-neutral-800 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function App() {
  const queryClient = useQueryClient();

  const health = useQuery(trpc.health.check.queryOptions());
  const todos = useQuery(trpc.todos.list.queryOptions());

  // protected-процедура: клиент шлёт Authorization из src/trpc.ts
  const clearCompleted = useMutation(
    trpc.todos.clearCompleted.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.todos.pathFilter()),
    }),
  );

  const done = todos.data?.filter(todo => todo.done).length ?? 0;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">admin-app-example</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            те же пакеты, другое приложение и тёмная тема по умолчанию
          </p>
        </div>
        <Badge tone={health.isSuccess ? 'success' : 'danger'}>
          {health.isSuccess ? 'API ok' : 'API down'}
        </Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Задачи</CardTitle>
          <Button
            size="sm"
            variant="danger"
            disabled={done === 0 || clearCompleted.isPending}
            onClick={() => clearCompleted.mutate()}
          >
            Удалить выполненные
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Stat label="всего" value={String(todos.data?.length ?? 0)} />
          <Stat label="выполнено" value={String(done)} />
          <Stat
            label="uptime"
            value={health.data ? `${health.data.uptime}s` : '—'}
          />
        </CardContent>
      </Card>
    </main>
  );
}
