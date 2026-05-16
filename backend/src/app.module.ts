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

@Module({
  imports: [
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
    BasketModule,
    StockReceiptModule,
    TicketModule,
    ReturnsModule,
    InventoryAdjustmentModule,
    SettingsModule,
    AuthModule,
    CustomerOrderModule,
    CustomerModule,
  ],
})
export class AppModule {}
