import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthSession } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private session: AuthSession | null = null;
  public authChanges = new BehaviorSubject<AuthSession | null>(null);

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.authChanges.next(session);
    });
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }
}