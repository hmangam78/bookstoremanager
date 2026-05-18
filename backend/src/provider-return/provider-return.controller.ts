import { Controller, Post, Get, Body, ParseIntPipe, Query, Patch, Delete, Param } from '@nestjs/common';
import { ProviderReturnService } from './provider-return.service';
import { CreateProviderReturnDTO, UpdateProviderReturnDTO } from './dto/providerReturn.dto';

@Controller('provider-return')
export class ProviderReturnController {

    constructor(
        private readonly providerReturnService: ProviderReturnService,
    ) {}

    @Get()
    getAllReturns() {
        return this.providerReturnService.getAllReturns();
    }

    @Get('active')
    getActiveReturns() {
        return this.providerReturnService.getActiveReturns();
    }

    @Get('finished')
    getFinishedReturns() {
        return this.providerReturnService.getFinishedReturns();
    }

    @Get(':id')
    getReturnById(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.getReturnById(id);
    }

    @Post()
    createReturn(@Body() returnData: CreateProviderReturnDTO) {
        return this.providerReturnService.createReturn(returnData);
    }

    @Patch(':id')
    updateReturn(@Param('id', ParseIntPipe) id: number, @Body() returnData: UpdateProviderReturnDTO) {
        return this.providerReturnService.updateReturn(id, returnData);
    }

    @Delete(':id')
    cancelReturn(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.cancelReturn(id);
    }

    @Patch(':id/send')
    sendReturn(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.sendReturn(id);
    }

    @Get('by-providerId')
    getReturnsByProvider(@Query('providerId', ParseIntPipe) providerId: number) {
        return this.providerReturnService.getReturnsByProvider(providerId);
    }

    @Get('by-publisher')
    getReturnsByPublisher(@Query('publisherId', ParseIntPipe) publisherId: number) {
        return this.providerReturnService.getReturnsByPublisher(publisherId);
    }
}
