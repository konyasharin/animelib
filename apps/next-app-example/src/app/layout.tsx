import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Providers } from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'next-app-example',
  description: 'Next.js App Router поверх пакетов монорепы',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
