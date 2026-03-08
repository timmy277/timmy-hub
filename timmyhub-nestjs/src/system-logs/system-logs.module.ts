import { Module, Global } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { SystemLogsController } from './system-logs.controller';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
    imports: [DatabaseModule],
    controllers: [SystemLogsController],
    providers: [SystemLogsService],
    exports: [SystemLogsService],
})
export class SystemLogsModule {}
