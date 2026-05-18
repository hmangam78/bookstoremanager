import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book, Uncatalogued } from './entities/bookEntity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider, Publisher } from '../provider-return/entities/providerReturnEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Uncatalogued, Provider, Publisher])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
