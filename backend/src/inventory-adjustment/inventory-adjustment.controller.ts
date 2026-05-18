import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { InventoryAdjustmentService } from './inventory-adjustment.service';
import { AdjustStockDTO } from './dto/adjustStock.dto';
import { AuthLevel } from 'src/auth/auth.service';
import { RequireAuth } from 'src/auth/auth.guard';

@Controller('inventory-adjustment')
export class InventoryAdjustmentController {
    constructor(
        private inventoryAdjustmentService: InventoryAdjustmentService,
    ) {}

    @Post()
    @RequireAuth(AuthLevel.ADMIN)
    adjustOne(@Body(new ValidationPipe({ transform: true })) itemData: AdjustStockDTO) {
        return this.inventoryAdjustmentService.adjustOne(itemData);
    }

    @Post('/adjustStock')
    @RequireAuth(AuthLevel.ADMIN)
    adjustBatch(@Body(new ValidationPipe({ transform: true})) itemDataArray: AdjustStockDTO[]) {
        return this.inventoryAdjustmentService.adjustBatch(itemDataArray);
    }
}
