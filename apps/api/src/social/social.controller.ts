import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

@Controller('social')
@UseGuards(SupabaseAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('friends')
  async friends(@CurrentUser() user: AuthUser) {
    return this.socialService.listFriends(user.id);
  }

  @Post('friends/request')
  async request(@CurrentUser() user: AuthUser, @Body() body: { addresseeId: string }) {
    return this.socialService.requestFriend(user.id, body.addresseeId);
  }

  @Post('friends/accept')
  async accept(@CurrentUser() user: AuthUser, @Body() body: { friendshipId: string }) {
    return this.socialService.acceptFriend(body.friendshipId, user.id);
  }

  @Post('friends/block')
  async block(@CurrentUser() user: AuthUser, @Body() body: { targetId: string }) {
    return this.socialService.blockUser(user.id, body.targetId);
  }
}
