import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { UserData } from '../../models/user-data';
import { CommonModule } from '@angular/common';
const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy {
  constructor(private supabaseService: SupabaseService) { }
  userData: (UserData & { authEmail?: string }) | null = null;
  private authSubscription: any;
  lastLogin: string | null = null;
  ngOnInit(): void {
    this.authSubscription = this.supabaseService.authChanges.subscribe(
      (session) => {
        if (session) {
          this.getCurrentUserData(session.user.id, session.user.email);
        } else {
          this.userData = null;
        }
      }
    );

    this.supabaseService.getSession().then(session => {
      if (session?.user) {
        this.getCurrentUserData(session.user.id, session.user.email);
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  async getCurrentUserData(userId: string, userEmail?: string) {
    const { data, error } = await supabase
      .from('users-data')
      .select('*')
      .eq('authId', userId)
      .single();

    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('User data:', data);
      this.userData = {
        ...data,
        authEmail: userEmail
      };
    }
  }

  getAvatarUrl(avatarUrl: string) {
    console.log('Getting public URL for avatar:', avatarUrl);
    const customError: any = null;
    // Verifica si `avatarUrl` ya es una URL completa
    if (avatarUrl.startsWith('http')) {
      console.warn('Avatar URL is already a full URL:', avatarUrl);
      return avatarUrl; // Devuelve la URL directamente si ya es completa
    }
  
    // Genera la URL pública desde Supabase
    const { data } = supabase.storage.from('images').getPublicUrl(avatarUrl);
  
    if (!data) {
      console.error('Error fetching public URL for avatar: No data returned');
      return null;
    }
  
    if (data?.publicUrl) {
      console.log('Public URL fetched successfully:', data.publicUrl);
      return data.publicUrl;
    } else {
      console.warn('No public URL returned for avatar');
      return null;
    }
  }
  // getAvatarUrl(avatarUrl: string) {
  //   return supabase.storage.from('images').getPublicUrl(avatarUrl).data.publicUrl;
  // }
}