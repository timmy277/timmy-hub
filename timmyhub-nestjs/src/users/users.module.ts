import { Module, Global } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CommonModule } from '../common/common.module';

@Global()
@Module({
    imports: [CommonModule],
    controllers: [UsersController],
    providers: [UsersService, AuditLogInterceptor],
    exports: [UsersService],
})
export class UsersModule {}
