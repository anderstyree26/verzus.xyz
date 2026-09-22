import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OCRService } from './ocr.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';

@Controller('ocr')
export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('verify')
  async verify(@Body() body: { image: string }) {
    return this.ocrService.verifyServerOCR(body.image);
  }
}
