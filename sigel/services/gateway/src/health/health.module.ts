import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'sigel-gateway', timestamp: new Date().toISOString() };
  }

  @Get('metrics')
  metrics() {
    // En producción, exponer Prometheus via prom-client middleware
    return { uptime: process.uptime(), memory: process.memoryUsage() };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
