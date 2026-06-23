import {
    Controller,
    Get,
    Query,
    UseGuards,
    DefaultValuePipe,
    ParseIntPipe,
    Param,
} from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('System Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('system-logs')
export class SystemLogsController {
    constructor(private readonly systemLogsService: SystemLogsService) {}

    @Get()
    @ApiOperation({ summary: 'Get system audit logs list (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'action', required: false, type: String })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiQuery({ name: 'entityType', required: false, type: String })
    async getLogs(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
        @Query('action') action?: string,
        @Query('userId') userId?: string,
        @Query('entityType') entityType?: string,
    ) {
        return this.systemLogsService.getLogs(page, limit, { action, userId, entityType });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get system audit log detail with diff (Admin only)' })
    async getLogDetail(@Param('id') id: string) {
        const log = await this.systemLogsService.getLogDetail(id);
        return ResponseDto.success('OK', log);
    }
}
