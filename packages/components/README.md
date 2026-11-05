# `@repo/components`

Общие React-компоненты, стилизованные только Tailwind-утилитами поверх токенов из
[`@repo/tailwind-config`](../tailwind-config). Пока внутри только `cn()`.

## Особенности

- пакет не собирается: `exports` указывает на `./src/index.ts`, компилирует его
  приложение (just-in-time package). Поэтому нет `build`, а `check-types`
  гоняет `tsc --noEmit`;
- React 19 — `ref` приходит обычным пропом, `forwardRef` не нужен;
- `cn()` (clsx + tailwind-merge) экспортируется наружу, чтобы приложения
  переопределяли классы без конфликтов.

Приложению нужно добавить пакет в источники Tailwind, иначе классы вырежутся:

```css
@source '../node_modules/@repo/components/src';
```
