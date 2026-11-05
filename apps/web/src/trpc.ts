import type { AppRouter } from '@repo/server';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

/** Клиентские компоненты ходят в свой же route handler. */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
