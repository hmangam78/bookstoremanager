import { Controller, Post, Get, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ProviderReturnService } from './provider-return.service';

@Controller('provider-return')
export class ProviderReturnController {

    constructor(
        private readonly providerReturnService: ProviderReturnService,
    ) {}

    @Get()
    getAllReturns() {
        return this.providerReturnService.getAllReturns();
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
