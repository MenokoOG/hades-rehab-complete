import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ForensicsService } from './forensics.service';
import { TriageService } from './triage.service';
@Module({
  controllers: [ProxyController],
  providers: [ForensicsService, TriageService],
})
export class AppModule {}
