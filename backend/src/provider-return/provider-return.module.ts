import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderReturnService } from './provider-return.service';
import { ProviderReturnController } from './provider-return.controller';
import { Provider, ProviderReturn, Publisher } from './entities/providerReturnEntity';
import { Book } from '../books/entities/bookEntity';
import { StockMovement } from 'src/stock-receipt/entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderReturn, Publisher, Book, StockMovement])],
  providers: [ProviderReturnService],
  controllers: [ProviderReturnController],
  exports: [ProviderReturnService],
})
export class ProviderReturnModule {}
