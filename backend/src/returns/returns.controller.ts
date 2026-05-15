import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnTicketDTO } from './dto/return-ticket.dto';

@Controller('returns')
export class ReturnsController {
    constructor(private readonly returnsService: ReturnsService) {}

    @Post()
    returnTicket(@Body(new ValidationPipe({ transform: true })) returnData: ReturnTicketDTO) {
        return this.returnsService.processReturn(returnData);
    }
}
