import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [TasksModule, BooksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
