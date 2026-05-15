import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { InventoryAdjustmentService } from './inventory-adjustment.service';
import { AdjustStockDTO } from './dto/adjustStock.dto';

@Controller('inventory-adjustment')
export class InventoryAdjustmentController {
    constructor(
        private inventoryAdjustmentService: InventoryAdjustmentService,
    ) {}

    @Post()
    adjustOne(@Body(new ValidationPipe({ transform: true })) itemData: AdjustStockDTO) {
        return this.inventoryAdjustmentService.adjustOne(itemData);
    }
}
