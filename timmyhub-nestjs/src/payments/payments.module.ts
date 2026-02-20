import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { PaymentsController } from './payments.controller';
import { VnpayService } from './vnpay.service';

@Module({
    imports: [DatabaseModule, ConfigModule],
    controllers: [PaymentsController],
    providers: [VnpayService],
    exports: [VnpayService],
})
export class PaymentsModule {}
