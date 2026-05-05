import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    TasksModule,
    BooksModule,
    SalesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5555,
      username: 'user',
      password: 'password',
      database: 'mydb',
      autoLoadEntities: true,
      synchronize: true, // solo en desarrollo
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
