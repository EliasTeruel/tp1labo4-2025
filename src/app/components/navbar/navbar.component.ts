import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  private authSubscription!: Subscription;
  email: any;

  constructor(private supabase: SupabaseService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.authSubscription = this.supabase.authChanges.subscribe(
      (session) => {
        this.isLoggedIn = !!session;
      }
    );
    this.email = this.authService.getCurrentUserEmail();
    console.log(this.email);
    this.supabase.getSession().then(session => {
      this.isLoggedIn = !!session;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    await this.supabase.signOut();
    this.authService.clearUserInfo();
    this.router.navigate(['/login']);
  }
}