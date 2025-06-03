import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthSession } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  static from(tableName: string) {
    throw new Error('Method not implemented.');
  }
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
  get client(): SupabaseClient {
    return this.supabase;
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async getUserData(userId: string) {
    return await this.supabase
      .from('users-data')
      .select('*')
      .eq('authId', userId)
      .single();
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }
  getMessages() {
    return this.supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
  }

  sendMessage(text: string, sender: string) {
    return this.supabase.from('messages').insert([{ text, sender }]);
  }

  listenToMessages(callback: Function) {
    this.supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  }
}