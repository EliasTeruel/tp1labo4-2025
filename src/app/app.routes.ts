import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent,},
    { path: 'profile', component: ProfileComponent },
    {
        path: 'chat',
        loadComponent: () =>
          import('./components/chat/chat.component').then((m) => m.ChatComponent),
      },
    {
        path: 'games',
        children: [
            {
                path: 'ahorcado',
                loadComponent: () => import('./components/games/ahorcado/ahorcado.component').then(m => m.AhorcadoComponent),
            },
            {
                path: 'mayorMenor',
                loadComponent: () => import('./components/games/mayor-menor/mayor-menor.component').then(m => m.MayorMenorComponent),
            },
            {
                path: 'preguntados',
                loadComponent: () => import('./components/games/preguntados/preguntados.component').then(m => m.PreguntadosComponent),
            },
            {
                path: '2048',
                loadComponent: () => import('./components/games/juego2048/juego2048.component').then(m => m.Juego2048Component),
            },
        ],
    },
];