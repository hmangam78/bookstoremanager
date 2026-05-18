import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesModule } from './sales/sales.module';
import { BasketModule } from './basket/basket.module';
import { StockReceiptModule } from './stock-receipt/stock-receipt.module';
import { TicketModule } from './ticket/ticket.module';
import { ReturnsModule } from './returns/returns.module';
import { InventoryAdjustmentModule } from './inventory-adjustment/inventory-adjustment.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { CustomerOrderModule } from './customer-order/customer-order.module';
import { CustomerModule } from './customer/customer.module';
import { ProviderReturnModule } from './provider-return/provider-return.module';

@Module({
  imports: [
    BooksModule,
    SalesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5555),
      username: process.env.DB_USER ?? 'user',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_NAME ?? 'mydb',
      autoLoadEntities: true,
      synchronize:
        process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    }),
    BasketModule,
    StockReceiptModule,
    TicketModule,
    ReturnsModule,
    InventoryAdjustmentModule,
    SettingsModule,
    AuthModule,
    CustomerOrderModule,
    CustomerModule,
    ProviderReturnModule,
  ],
})
export class AppModule {}
