import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/components';

export default function Page() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">next-app-example</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            App Router + @repo/components
          </p>
        </div>
        <Badge tone="brand">next 16</Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Компоненты из пакета</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm">primary</Button>
          <Button size="sm" variant="secondary">
            secondary
          </Button>
          <Button size="sm" variant="ghost">
            ghost
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
