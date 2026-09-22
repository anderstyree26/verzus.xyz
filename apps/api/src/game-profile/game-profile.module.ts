import { Module } from '@nestjs/common';
import { GameProfileController } from './game-profile.controller';
import { GameProfileService } from './game-profile.service';

@Module({
  controllers: [GameProfileController],
  providers: [GameProfileService],
  exports: [GameProfileService],
})
export class GameProfileModule {}
