import { Module, Global } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { CommonModule } from '../common/common.module';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@Global()
@Module({
    imports: [CommonModule],
    controllers: [RbacController],
    providers: [RbacService, AuditLogInterceptor],
    exports: [RbacService],
})
export class RbacModule {}
