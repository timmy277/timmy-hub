import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [BrandsController],
})
export class BrandsModule {}
