# `@repo/components`

React-компоненты, стилизованные только Tailwind-утилитами поверх токенов из
[`@repo/tailwind-config`](../tailwind-config). Никакого собственного CSS,
CSS-in-JS и рантайм-темизации — только классы.

## Особенности

- пакет не собирается: `exports` указывает на `./src/index.ts`, компилирует его
  приложение (just-in-time package). Поэтому нет `build`, а `check-types`
  гоняет `tsc --noEmit`;
- React 19 — `ref` приходит обычным пропом, `forwardRef` не нужен;
- `cn()` (clsx + tailwind-merge) экспортируется наружу, чтобы приложения
  переопределяли классы без конфликтов.

## Использование

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/components';

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <Badge tone="success">online</Badge>
  </CardHeader>
  <CardContent>
    <Button variant="secondary" size="sm">
      Кнопка
    </Button>
  </CardContent>
</Card>;
```

Приложению нужно добавить пакет в источники Tailwind, иначе классы вырежутся:

```css
@source '../node_modules/@repo/components/src';
```

## Состав

`Button` (`primary` / `secondary` / `ghost` / `danger`, размеры `sm` / `md` / `lg`),
`Card` + `CardHeader` / `CardTitle` / `CardContent` / `CardFooter`, `Input`,
`Badge` (`neutral` / `brand` / `success` / `danger`), `cn`.
