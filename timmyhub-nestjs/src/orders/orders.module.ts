import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CommonModule } from '../common/common.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@Module({
    imports: [DatabaseModule, VouchersModule, AddressesModule, CommonModule],
    controllers: [OrdersController],
    providers: [OrdersService, AuditLogInterceptor],
    exports: [OrdersService],
})
export class OrdersModule {}
