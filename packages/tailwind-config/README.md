# `@repo/tailwind-config`

Общие дизайн-токены для Tailwind CSS 4. В v4 конфигурация живёт в CSS, поэтому
пакет отдаёт не `tailwind.config.js`, а `theme.css`. Токены добавляются в блок
`@theme { … }`.

## Подключение

`globals.css` приложения:

```css
@import 'tailwindcss';
@import '@repo/tailwind-config';

/* классы из внутренних пакетов Tailwind по умолчанию не сканирует —
   node_modules исключены, путь указывается относительно этого файла */
@source '../../node_modules/@repo/components/src';
```

## Что внутри

- вариант `dark:` через класс (`<html class="dark">`), а не media-query
