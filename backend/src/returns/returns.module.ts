import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Module({
  providers: [ReturnsService]
})
export class ReturnsModule {}
