import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [TerminusModule, HttpModule, DatabaseModule],
    controllers: [HealthController, MetricsController],
    providers: [MetricsService],
    exports: [MetricsService],
})
export class HealthModule {}
