import { Controller, Post, Get, Body, ParseIntPipe, Query, Patch, Delete, Param } from '@nestjs/common';
import { ProviderReturnService } from './provider-return.service';
import { CreateProviderReturnDTO, UpdateProviderReturnDTO } from './dto/providerReturn.dto';
import { AuthLevel } from 'src/auth/auth.service';
import { RequireAuth } from 'src/auth/auth.guard';

@Controller('provider-return')
export class ProviderReturnController {

    constructor(
        private readonly providerReturnService: ProviderReturnService,
    ) {}

    @Get()
    @RequireAuth(AuthLevel.ADMIN)
    getAllReturns() {
        return this.providerReturnService.getAllReturns();
    }

    @Get('active')
    @RequireAuth(AuthLevel.ADMIN)
    getActiveReturns() {
        return this.providerReturnService.getActiveReturns();
    }

    @Get('finished')
    @RequireAuth(AuthLevel.ADMIN)
    getFinishedReturns() {
        return this.providerReturnService.getFinishedReturns();
    }

    @Get(':id')
    @RequireAuth(AuthLevel.ADMIN)
    getReturnById(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.getReturnById(id);
    }

    @Post()
    @RequireAuth(AuthLevel.ADMIN)
    createReturn(@Body() returnData: CreateProviderReturnDTO) {
        return this.providerReturnService.createReturn(returnData);
    }

    @Patch(':id')
    @RequireAuth(AuthLevel.ADMIN)
    updateReturn(@Param('id', ParseIntPipe) id: number, @Body() returnData: UpdateProviderReturnDTO) {
        return this.providerReturnService.updateReturn(id, returnData);
    }

    @Delete(':id')
    @RequireAuth(AuthLevel.ADMIN)
    cancelReturn(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.cancelReturn(id);
    }

    @Patch(':id/send')
    @RequireAuth(AuthLevel.ADMIN)
    sendReturn(@Param('id', ParseIntPipe) id: number) {
        return this.providerReturnService.sendReturn(id);
    }

    @Get('by-providerId')
    @RequireAuth(AuthLevel.ADMIN)
    getReturnsByProvider(@Query('providerId', ParseIntPipe) providerId: number) {
        return this.providerReturnService.getReturnsByProvider(providerId);
    }

    @Get('by-publisher')
    @RequireAuth(AuthLevel.ADMIN)
    getReturnsByPublisher(@Query('publisherId', ParseIntPipe) publisherId: number) {
        return this.providerReturnService.getReturnsByPublisher(publisherId);
    }
}
