import { Component, OnInit, OnDestroy } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { UserData } from '../../models/user-data';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { SupabaseService } from '../../services/supabase.service';


const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private supabase: SupabaseService) { }
  usersdata: UserData[] = [];
  isLoggedIn = false;
  private authSubscription!: Subscription;


  ngOnInit(): void {
    this.authSubscription = this.supabase.authChanges.subscribe(
      (session) => {
        this.isLoggedIn = !!session;
      }
    );

    this.supabase.getSession().then(session => {
      this.isLoggedIn = !!session;
    });
    localStorage.removeItem('UserMailRegistered');
    localStorage.removeItem('UserPWDRegisted');
  }
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  jugarJuego(juego: string) {
    if (true) {
      console.log('Juego:', juego);
      this.router.navigate([`/games/${juego}`]);

    } else {
      alert('Por favor, inicie sesión para jugar.');  
    }
  }



}