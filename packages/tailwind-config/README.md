# `@repo/tailwind-config`

Общие дизайн-токены для Tailwind CSS 4. В v4 конфигурация живёт в CSS, поэтому
пакет отдаёт не `tailwind.config.js`, а `theme.css` с блоком `@theme`.

## Подключение

`src/index.css` приложения:

```css
@import 'tailwindcss';
@import '@repo/tailwind-config';

/* классы из внутренних пакетов Tailwind по умолчанию не сканирует —
   node_modules исключены, путь указывается относительно этого файла */
@source '../node_modules/@repo/components/src';
```

В `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

## Что внутри

- палитра `brand-50…950` — `bg-brand-600`, `text-brand-700`, …
- шрифты `font-sans` / `font-mono` (переопределяют дефолтные namespace'ы)
- радиусы `rounded-card`, `rounded-control`, тень `shadow-card`
- анимация `animate-fade-in` (`@keyframes` внутри `@theme`, как в документации)
- вариант `dark:` через класс (`<html class="dark">`), а не media-query
- базовый слой: фон и типографика `body`, тёмная тема через `@variant dark`

Токены — обычные CSS-переменные, поэтому доступны и напрямую:
`var(--color-brand-500)`.

## Почему нет семантических токенов вроде `--color-surface`

Подменять значения одной переменной внутри `.dark { … }` — приём из чужих
дизайн-систем, в документации Tailwind такого нет. Здесь используется только
документированное: нейтральная палитра плюс вариант `dark:` на утилитах
(`bg-white dark:bg-neutral-900`), а для CSS вне утилит — `@variant dark { … }`.
