import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req): Promise<DashboardStatsDto> {
    // The JwtAuthGuard adds the user object to the request
    return this.dashboardService.getUserStats(req.user.id);
  }
}