import { Injectable, NotFoundException } from '@nestjs/common';
import { createServiceClient, TypedSupabaseClient } from '@antigravity/db';
import type { GameType, Platform, ROI } from '@antigravity/core';

@Injectable()
export class GameProfileService {
  private supabase: TypedSupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
    this.supabase = createServiceClient(url, key);
  }

  async listApproved() {
    const { data, error } = await this.supabase
      .from('game_profiles')
      .select('*')
      .eq('approved', true)
      .order('play_count', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('game_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) throw new NotFoundException('Game profile not found');
    return data;
  }

  async submitProfile(
    userId: string,
    profile: {
      displayName: string;
      gameType: GameType;
      platform: Platform;
      roi: ROI;
      constraints?: Record<string, unknown>;
      endKeywords?: string[];
      regexPattern?: string;
    },
  ) {
    const { data, error } = await this.supabase
      .from('game_profiles')
      .insert({
        display_name: profile.displayName,
        game_type: profile.gameType,
        platform: profile.platform,
        roi: profile.roi as never,
        constraints: (profile.constraints ?? {}) as never,
        end_keywords: profile.endKeywords ?? [],
        regex_pattern: profile.regexPattern ?? null,
        submitted_by: userId,
        approved: false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async approveProfile(id: string, adminId: string) {
    const { data, error } = await this.supabase
      .from('game_profiles')
      .update({ approved: true, approved_by: adminId })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateCalibration(id: string, roi: ROI) {
    const { data, error } = await this.supabase
      .from('game_profiles')
      .update({ roi: roi as never })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
