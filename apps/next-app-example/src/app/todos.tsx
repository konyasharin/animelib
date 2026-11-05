'use client';

import { type FormEvent, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trpc } from '../trpc';

export function Todos({ initialCount }: { initialCount: number }) {
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (title.trim()) {
      addTodo.mutate({ title: title.trim() });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи</CardTitle>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          на сервере отрендерено: {initialCount}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.data?.map(todo => (
          <label key={todo.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo.mutate({ id: todo.id })}
              className="size-4 accent-brand-600"
            />
            <span className={todo.done ? 'line-through opacity-60' : undefined}>
              {todo.title}
            </span>
          </label>
        ))}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Новая задача"
          />
          <Button type="submit" disabled={addTodo.isPending}>
            Добавить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
