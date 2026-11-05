import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/components';

import heroImage from './assets/hero.png';

// классы пишутся целиком: Tailwind ищет их в исходниках строкой и
// `bg-brand-${shade}` не найдёт
const BRAND_SWATCHES = [
  'bg-brand-300',
  'bg-brand-400',
  'bg-brand-500',
  'bg-brand-600',
  'bg-brand-700',
] as const;

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
        <Input placeholder="Input из @repo/components" />
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
              Vite + React + @repo/components
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {isDark ? 'светлая тема' : 'тёмная тема'}
        </Button>
      </header>

      <DesignTokens />
    </main>
  );
}
