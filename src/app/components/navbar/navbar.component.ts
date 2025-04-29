import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  private authSubscription!: Subscription;

  constructor(private supabase: SupabaseService,private router: Router) {}

  ngOnInit() {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.supabase.authChanges.subscribe(
      (session) => {
        this.isLoggedIn = !!session;
      }
    );
    
    // Verificar estado inicial
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
    this.router.navigate(['/login']);
  }
}