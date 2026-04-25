import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../auth/decorators';

@Controller('health')
@Public()
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private prisma: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
        private prismaService: PrismaService,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // Database check
            () => this.prisma.pingCheck('database', this.prismaService),

            // Memory check (heap should not exceed 150MB)
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

            // RSS memory check (should not exceed 300MB)
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
        ]);
    }

    @Get('detailed')
    @HealthCheck()
    checkDetailed() {
        return this.health.check([
            // Database
            () => this.prisma.pingCheck('database', this.prismaService),

            // Memory checks
            () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 400 * 1024 * 1024),

            // Disk storage (80% threshold)
            () =>
                this.disk.checkStorage('disk', {
                    path: '/',
                    thresholdPercent: 0.8,
                }),
        ]);
    }

    @Get('live')
    live() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get('ready')
    @HealthCheck()
    ready() {
        return this.health.check([() => this.prisma.pingCheck('database', this.prismaService)]);
    }
}
