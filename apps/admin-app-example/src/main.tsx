import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';

import { App } from './app';
import { queryClient } from './trpc';

import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Не найден контейнер #root');
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
