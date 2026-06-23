import { Global, Module } from '@nestjs/common';
import { AuditHelperService } from './services/audit-helper.service';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
    imports: [DatabaseModule],
    providers: [AuditHelperService],
    exports: [AuditHelperService],
})
export class CommonModule {}
