import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!user.id) {
        throw new UnauthorizedException('User ID not found in token');
      }

      return { userId: user.id };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
}

