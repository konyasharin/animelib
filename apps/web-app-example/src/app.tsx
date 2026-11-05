import { type FormEvent, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import heroImage from './assets/hero.png';
import { trpc } from './trpc';

// классы пишутся целиком: Tailwind ищет их в исходниках строкой и
// `bg-brand-${shade}` не найдёт
const BRAND_SWATCHES = [
  'bg-brand-300',
  'bg-brand-400',
  'bg-brand-500',
  'bg-brand-600',
  'bg-brand-700',
] as const;

function ApiStatus() {
  const health = useQuery(trpc.health.check.queryOptions());

  if (health.isPending) {
    return <Badge>проверяю API…</Badge>;
  }

  if (health.isError) {
    return <Badge tone="danger">API недоступен</Badge>;
  }

  return <Badge tone="success">API up {health.data.uptime}s</Badge>;
}

function Todos() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const todos = useQuery(trpc.todos.list.queryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries(trpc.todos.pathFilter());

  const addTodo = useMutation(
    trpc.todos.add.mutationOptions({
      onSuccess: () => {
        setTitle('');
        void invalidate();
      },
    }),
  );

  const toggleTodo = useMutation(
    trpc.todos.toggle.mutationOptions({ onSuccess: invalidate }),
  );

  const removeTodo = useMutation(
    trpc.todos.remove.mutationOptions({ onSuccess: invalidate }),
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (title.trim()) {
      addTodo.mutate({ title: title.trim() });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи из @repo/server</CardTitle>
        <ApiStatus />
      </CardHeader>

      <CardContent className="space-y-2">
        {todos.isPending && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Загружаю…
          </p>
        )}

        {todos.isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Не отвечает API. Запусти его: <code>pnpm dev</code> в корне
            репозитория.
          </p>
        )}

        {todos.data?.map(todo => (
          <div
            key={todo.id}
            className="flex animate-fade-in items-center gap-3 rounded-control px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo.mutate({ id: todo.id })}
              className="size-4 accent-brand-600"
            />
            <span
              className={
                todo.done
                  ? 'flex-1 text-neutral-500 dark:text-neutral-400 line-through'
                  : 'flex-1'
              }
            >
              {todo.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTodo.mutate({ id: todo.id })}
            >
              удалить
            </Button>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Новая задача"
          />
          <Button type="submit" disabled={addTodo.isPending}>
            Добавить
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

function DesignTokens() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Токены из @repo/tailwind-config</CardTitle>
        <Badge tone="brand">tailwind 4</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {BRAND_SWATCHES.map(swatch => (
            <div
              key={swatch}
              className={`h-12 flex-1 rounded-control ${swatch}`}
              title={swatch}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">primary</Button>
          <Button size="sm" variant="secondary">
            secondary
          </Button>
          <Button size="sm" variant="ghost">
            ghost
          </Button>
          <Button size="sm" variant="danger">
            danger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={heroImage} alt="" className="size-10 rounded-control" />
          <div>
            <h1 className="text-xl font-semibold">web-app-example</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Vite + React + @repo/components + tRPC
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {isDark ? 'светлая тема' : 'тёмная тема'}
        </Button>
      </header>

      <Todos />
      <DesignTokens />
    </main>
  );
}
