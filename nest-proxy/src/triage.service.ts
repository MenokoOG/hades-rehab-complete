import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TriageService implements OnModuleInit, OnModuleDestroy {
  supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_KEY || '';
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  async onModuleInit() {
    // No schema migrations here. Ensure triage_events and user_roles tables exist in Supabase.
    console.log('TriageService initialized (Supabase) - ensure triage_events & user_roles exist in your project');
  }

  async onModuleDestroy() {
    // nothing to do
  }

  async saveTriage(event: { forensic_id?: string, user_id?: string, tags?: any, comment?: string }) {
    const row = {
      forensic_id: event.forensic_id || null,
      user_id: event.user_id || null,
      tags: event.tags || [],
      comment: event.comment || null,
      created_at: new Date().toISOString()
    };
    const r = await this.supabase.from('triage_events').insert([row]).select().limit(1);
    if (r.error) throw r.error;
    return r.data?.[0];
  }

  // RBAC: get role for user_id from user_roles table
  async getUserRole(userId: string) {
    if (!userId) return null;
    const r = await this.supabase.from('user_roles').select('role').eq('user_id', userId).limit(1);
    if (r.error) return null;
    return r.data?.[0]?.role || null;
  }
}
