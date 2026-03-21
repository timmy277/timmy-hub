import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { AddressesModule } from '../addresses/addresses.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [DatabaseModule, VouchersModule, AddressesModule],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
