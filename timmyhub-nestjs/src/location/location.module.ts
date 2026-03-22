import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [LocationController],
    providers: [LocationService],
    exports: [LocationService],
})
export class LocationModule {}
