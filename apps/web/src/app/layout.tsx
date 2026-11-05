import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Providers } from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'animelib',
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
