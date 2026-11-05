import { prisma } from '../src';

await prisma.todo.createMany({
  data: [
    { title: 'Поднять turbo dev', done: true },
    { title: 'Подключить @repo/components', done: false },
  ],
});

console.log('Сиды залиты');
