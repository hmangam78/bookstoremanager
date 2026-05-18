import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnTicketDTO } from './dto/return-ticket.dto';
import { AuthLevel } from 'src/auth/auth.service';
import { RequireAuth } from 'src/auth/auth.guard';

@Controller('returns')
export class ReturnsController {
    constructor(private readonly returnsService: ReturnsService) {}

    @Post()
    @RequireAuth(AuthLevel.USER)
    returnTicket(@Body(new ValidationPipe({ transform: true })) returnData: ReturnTicketDTO) {
        return this.returnsService.processReturn(returnData);
    }
}
