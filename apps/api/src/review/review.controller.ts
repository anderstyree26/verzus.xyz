import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

@Controller('review')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('REVIEWER', 'ADMIN', 'SUPER_ADMIN')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('queue')
  async getQueue() {
    return this.reviewService.getQueue();
  }

  @Post(':taskId/approve')
  async approve(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { note?: string },
  ) {
    return this.reviewService.resolveTask(taskId, user.id, 'APPROVED', body.note);
  }

  @Post(':taskId/reject')
  async reject(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { note?: string },
  ) {
    return this.reviewService.resolveTask(taskId, user.id, 'REJECTED', body.note);
  }

  @Post(':taskId/correct')
  async correct(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { correctedValue: string; note?: string },
  ) {
    return this.reviewService.resolveTask(taskId, user.id, 'CORRECTED', body.note, body.correctedValue);
  }
}
