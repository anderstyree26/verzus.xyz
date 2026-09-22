import { Injectable } from '@nestjs/common';
import { createServiceClient, TypedSupabaseClient } from '@antigravity/db';

@Injectable()
export class AdminService {
  private supabase: TypedSupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
    this.supabase = createServiceClient(url, key);
  }

  async getPlatformStats() {
    const [{ count: userCount }, { count: matchCount }, { count: tournamentCount }] = await Promise.all([
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
      this.supabase.from('matches').select('*', { count: 'exact', head: true }),
      this.supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ]);

    return {
      users: userCount ?? 0,
      matches: matchCount ?? 0,
      tournaments: tournamentCount ?? 0,
    };
  }

  async listUsers(limit = 50, offset = 0) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return data;
  }

  async banUser(userId: string, reason: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_banned: true, ban_reason: reason, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async unbanUser(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_banned: false, ban_reason: null, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateUserRole(userId: string, role: 'PLAYER' | 'REVIEWER' | 'ADMIN' | 'SUPER_ADMIN') {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async listSponsors() {
    const { data, error } = await this.supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createSponsor(name: string, websiteUrl?: string, fundedAmount = 0) {
    const { data, error } = await this.supabase
      .from('sponsors')
      .insert({
        name,
        website_url: websiteUrl || null,
        funded_amount: fundedAmount,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
