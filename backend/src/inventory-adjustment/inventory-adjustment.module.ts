import { Module } from '@nestjs/common';
import { InventoryAdjustmentController } from './inventory-adjustment.controller';
import { InventoryAdjustmentService } from './inventory-adjustment.service';

@Module({
  controllers: [InventoryAdjustmentController],
  providers: [InventoryAdjustmentService]
})
export class InventoryAdjustmentModule {}
