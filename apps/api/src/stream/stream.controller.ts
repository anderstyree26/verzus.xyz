import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

@Controller('stream')
@UseGuards(SupabaseAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('link')
  async link(
    @CurrentUser() user: AuthUser,
    @Body() body: { matchId: string; platform: 'TWITCH' | 'YOUTUBE'; channelIdentifier: string },
  ) {
    return this.streamService.linkStream({
      matchId: body.matchId,
      userId: user.id,
      platform: body.platform,
      channelIdentifier: body.channelIdentifier,
    });
  }

  @Get('status/:matchId')
  async status(@Param('matchId') matchId: string) {
    return this.streamService.getStatus(matchId);
  }
}
