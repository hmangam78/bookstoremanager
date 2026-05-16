import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderReturnService } from './provider-return.service';
import { ProviderReturnController } from './provider-return.controller';
import { Provider, ProviderReturn } from './entities/providerReturnEntity';
import { Book } from '../books/entities/bookEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderReturn, Book])],
  providers: [ProviderReturnService],
  controllers: [ProviderReturnController],
  exports: [ProviderReturnService],
})
export class ProviderReturnModule {}
