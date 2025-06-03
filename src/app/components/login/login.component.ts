
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  userNotFound: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      userMail: ['', [Validators.required, Validators.email]],
      userPWD: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    const UserMailRegistered = localStorage.getItem('UserMailRegistered');
    const UserPWDRegisted = localStorage.getItem('UserPWDRegisted');
    localStorage.removeItem('swapUserMail');
    if (UserMailRegistered && UserPWDRegisted) {
      this.loginForm.patchValue({
        userMail: UserMailRegistered,
        userPWD: UserPWDRegisted
      });
    }
  }

  get userMail() {
    return this.loginForm.get('userMail');
  }

  get userPWD() {
    return this.loginForm.get('userPWD');
  }

  async checkIfUserExists() {
    const email = this.userMail?.value;
    if (this.userMail?.valid) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false }
        });
        
        this.userNotFound = !!error;
      } catch (error) {
        this.userNotFound = true;
      }
    }
  }
  
  quickLogin() {
    const savedUserMail = 'eliasteruel96@gmail.com';
    // const savedUserMail = localStorage.getItem('savedUserMail');
    if (savedUserMail) {
      this.loginForm.patchValue({
        userMail: savedUserMail,
        userPWD: '123456'
      });
    }
  }
  
  async login() {
    if (this.loginForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const { userMail, userPWD } = this.loginForm.value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userMail,
        password: userPWD
      });
      
      if (error) {
        this.handleLoginError(error);
      } else {
        await this.updateLastLogin(data.user.id);
        this.authService.setUserInfo(userMail);
        localStorage.setItem('savedUserMail', userMail);
        this.router.navigate(['/home']);
        localStorage.removeItem('UserMailRegistered');
        localStorage.removeItem('UserPWDRegisted');
      }
    } catch (error) {
      this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  private async updateLastLogin(userId: string) {
    try {
      const { error } = await supabase
        .from('users-data')
        .update({ last_login: new Date().toISOString() })
        .eq('authId', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error actualizando last_login:', error);
    }
  }

  private markAllAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
  
  private handleLoginError(error: any) {
    if (error.message.includes('Invalid login credentials')) {
      this.errorMessage = 'Contraseña o Email incorrecto.';
    } else if (error.message.includes('Email not confirmed')) {
      this.errorMessage = 'Por favor confirma tu correo electrónico primero.';
    } else {
      this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
    }
  }
  
  register() {
    const userMail = this.userMail?.value;

    localStorage.setItem('swapUserMail', userMail);
    this.router.navigate(['/register']);
  }
}

// import { Component, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { createClient, SupabaseClient } from '@supabase/supabase-js'
// import { environment } from '../../../environments/environment';
// import { CommonModule } from '@angular/common';
// import { Subscription } from 'rxjs';

// const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

// @Component({
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, FormsModule],
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent implements OnDestroy {
//   loginForm: FormGroup;
//   userNotFound: boolean = false;
//   showRegisterButton: boolean = false;
//   errorMessage: string = '';
//   isLoading: boolean = false;
//   private supabase: SupabaseClient;
//   private authSubscription?: Subscription;

//   // Contadores para bloqueo por intentos fallidos
//   failedAttempts: number = 0;
//   lastFailedAttemptTime: number | null = null;
//   isAccountLocked: boolean = false;
//   lockTimeRemaining: number = 0;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router
//   ) {
//     this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
    
//     this.loginForm = this.fb.group({
//       userMail: ['', [Validators.required, Validators.email]],
//       userPWD: ['', [
//         Validators.required,
//         Validators.minLength(6),
//       ]]
//     });

//     // Verificar si hay un bloqueo activo
//     this.checkAccountLockStatus();
//   }

//   ngOnDestroy(): void {
//     if (this.authSubscription) {
//       this.authSubscription.unsubscribe();
//     }
//   }

//   get userMail() {
//     return this.loginForm.get('userMail');
//   }

//   get userPWD() {
//     return this.loginForm.get('userPWD');
//   }

//   async checkIfUserExists() {
//     const email = this.userMail?.value;
//     if (this.userMail?.valid) {
//       try {
//         this.userNotFound = false;
//         this.showRegisterButton = false;
      
//         const { data, error } = await this.supabase.auth.signInWithOtp({
//           email,
//           options: {
//             shouldCreateUser: false 
//           }
//         });

//         if (error) {
//           if (error.message.includes("user not found") || error.status === 400) {
//             this.userNotFound = true;
//             this.showRegisterButton = true;
//           }
//         } else {
//           this.userNotFound = false;
//           this.showRegisterButton = false;
//         }
  
//         this.userNotFound = !!error;
//         this.showRegisterButton = !!error;
//       } catch (error) {
//         console.error('Error al verificar el correo:', error);
//         this.userNotFound = true;
//         this.showRegisterButton = true;
//       }
//     } else {
//       this.userNotFound = false;
//       this.showRegisterButton = false;
//     }
//   }
  
//   quickLogin() {
//     const savedUserMail = localStorage.getItem('savedUserMail');
//     if (savedUserMail) {
//       this.loginForm.patchValue({
//         userMail: savedUserMail,
//         userPWD: '123456'
//       });
//     }
//   }
  
//   async login() {
//     if (this.isAccountLocked) {
//       this.errorMessage = `Cuenta bloqueada temporalmente. Intenta nuevamente en ${this.lockTimeRemaining} segundos.`;
//       return;
//     }

//     if (this.loginForm.invalid) {
//       this.markAllAsTouched();
//       return;
//     }

//     this.errorMessage = '';
//     this.isLoading = true;

//     const { userMail, userPWD } = this.loginForm.value;
    
//     try {
//       const { data, error } = await this.supabase.auth.signInWithPassword({
//         email: userMail,
//         password: userPWD
//       });
      
//       if (error) {
//         this.handleLoginError(error);
//         this.recordFailedLoginAttempt(userMail);
//       } else {
//         await this.recordSuccessfulLogin(userMail);
//         localStorage.setItem('savedUserMail', userMail);
//         this.resetFailedAttempts();
//         this.router.navigate(['/home']);
//       }
//     } catch (error) {
//       this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
//       this.recordFailedLoginAttempt(userMail);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   private async recordSuccessfulLogin(email: string) {
//     try {
//       const { data, error } = await supabase
//         .from('login_logs')
//         .insert([
//           { 
//             email: email,
//             status: 'success',
//             ip_address: await this.getClientIP(),
//             user_agent: navigator.userAgent
//           }
//         ]);

//       if (error) throw error;
//     } catch (error) {
//       console.error('Error registrando login exitoso:', error);
//     }
//   }

//   private async recordFailedLoginAttempt(email: string) {
//     try {
//       const { data, error } = await supabase
//         .from('login_logs')
//         .insert([
//           { 
//             email: email,
//             status: 'failed',
//             ip_address: await this.getClientIP(),
//             user_agent: navigator.userAgent,
//             failure_reason: this.errorMessage
//           }
//         ]);

//       if (error) throw error;

//       // Incrementar contador de intentos fallidos
//       this.failedAttempts++;
//       this.lastFailedAttemptTime = Date.now();
//       localStorage.setItem('failedAttempts', this.failedAttempts.toString());
//       localStorage.setItem('lastFailedAttemptTime', this.lastFailedAttemptTime.toString());

//       // Bloquear después de 3 intentos fallidos
//       if (this.failedAttempts >= 3) {
//         this.lockAccountTemporarily();
//       }
//     } catch (error) {
//       console.error('Error registrando intento fallido:', error);
//     }
//   }

//   private async getClientIP(): Promise<string> {
//     try {
//       const response = await fetch('https://api.ipify.org?format=json');
//       const data = await response.json();
//       return data.ip || 'unknown';
//     } catch {
//       return 'unknown';
//     }
//   }

//   private lockAccountTemporarily() {
//     this.isAccountLocked = true;
//     this.lockTimeRemaining = 300; // 5 minutos en segundos
    
//     const lockInterval = setInterval(() => {
//       this.lockTimeRemaining--;
      
//       if (this.lockTimeRemaining <= 0) {
//         clearInterval(lockInterval);
//         this.isAccountLocked = false;
//         this.resetFailedAttempts();
//       }
//     }, 1000);
//   }

//   private checkAccountLockStatus() {
//     const storedAttempts = localStorage.getItem('failedAttempts');
//     const storedTime = localStorage.getItem('lastFailedAttemptTime');
    
//     if (storedAttempts && storedTime) {
//       this.failedAttempts = parseInt(storedAttempts);
//       this.lastFailedAttemptTime = parseInt(storedTime);
      
//       // Si han pasado más de 5 minutos desde el último intento, resetear
//       if (Date.now() - this.lastFailedAttemptTime > 300000) {
//         this.resetFailedAttempts();
//       } else if (this.failedAttempts >= 3) {
//         this.lockAccountTemporarily();
//         const timeElapsed = Math.floor((Date.now() - this.lastFailedAttemptTime) / 1000);
//         this.lockTimeRemaining = Math.max(0, 300 - timeElapsed);
//       }
//     }
//   }

//   private resetFailedAttempts() {
//     this.failedAttempts = 0;
//     this.lastFailedAttemptTime = null;
//     localStorage.removeItem('failedAttempts');
//     localStorage.removeItem('lastFailedAttemptTime');
//   }

//   private markAllAsTouched() {
//     Object.values(this.loginForm.controls).forEach(control => {
//       control.markAsTouched();
//     });
//   }
  
//   private handleLoginError(error: any) {
//     if (error.message.includes('Invalid login credentials')) {
//       this.errorMessage = 'Contraseña o Email incorrecto.';
//     } else if (error.message.includes('Email not confirmed')) {
//       this.errorMessage = 'Por favor confirma tu correo electrónico primero.';
//     } else if (error.message.includes('too many requests')) {
//       this.errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
//     } else {
//       this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
//     }
    
//     setTimeout(() => {
//       this.errorMessage = '';
//     }, 5000);
//   }
  
//   register() {
//     const userMail = this.userMail?.value;
//     localStorage.setItem('swapUserMail', userMail);
//     this.router.navigate(['/register']);
//   }
// }

// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { createClient, SupabaseClient } from '@supabase/supabase-js'
// import { environment } from '../../../environments/environment';
// import { CommonModule } from '@angular/common';

// const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

// @Component({
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, FormsModule],
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent {

//   loginForm: FormGroup;
//   userNotFound: boolean = false;
//   showRegisterButton: boolean = false;
//   errorMessage: string = '';
//   private supabase: SupabaseClient;

//   username: string = "";
//   password: string = "";

//   constructor(
//     private fb: FormBuilder,
//     private router: Router
//   ) {
//     this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
    
//     this.loginForm = this.fb.group({
//       userMail: ['', [Validators.required, Validators.email]],
//       userPWD: ['', [Validators.required]]
//     });
//   }


//   get userMail() {
//     return this.loginForm.get('userMail');
//   }

//   get userPWD() {
//     return this.loginForm.get('userPWD');
//   }

//   async checkIfUserExists() {
//     const email = this.userMail?.value;
//     if (this.userMail?.valid) {
//       try {
//         this.userNotFound = false;
//       this.showRegisterButton = false;
      
//         const { data, error } = await this.supabase.auth.signInWithOtp({
//           email,
//           options: {
//             shouldCreateUser: false 
//           }
//         });
//         if (error) {
//           if (error.message.includes("user not found") || error.status === 400) {
//             this.userNotFound = true;
//             this.showRegisterButton = true;
//           }
//         } else {
//           this.userNotFound = false;
//           this.showRegisterButton = false;
//         }
  
//         this.userNotFound = !!error;
//         this.showRegisterButton = !!error;
  
//       } catch (error) {
//         console.error('Error al verificar el correo:', error);
//         this.userNotFound = true;
//         this.showRegisterButton = true;
//       }
//     } else {
//       this.userNotFound = false;
//       this.showRegisterButton = false;
//     }
//   }
  
//   quickLogin() {
//     const savedUserMail = localStorage.getItem('savedUserMail');
//     if (savedUserMail) {
//       this.loginForm.patchValue({
//         userMail: savedUserMail,
//         userPWD: '123456'
//       });
//     }
//   }
  
//   async login() {
//     this.errorMessage = '';
//     // if (this.loginForm.valid && !this.userNotFound) {
//       if (true) {
//       const { userMail, userPWD } = this.loginForm.value;
      
//       try {
//         const { data, error } = await this.supabase.auth.signInWithPassword({
//           email: userMail,
//           password: userPWD
//         });
        
//         if (error) {
//           this.handleLoginError(error);
//         } else {
//           localStorage.setItem('savedUserMail', userMail);
//           this.router.navigate(['/home']);
//         }
//       } catch (error) {
//         this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
//       }
//     }
//   }
  
//   private handleLoginError(error: any) {
//     if (error.message.includes('Invalid login credentials')) {
//       this.errorMessage = 'Contraseña o Email incorrecto.';
//     } else if (error.message.includes('Email not confirmed')) {
//       this.errorMessage = 'Por favor confirma tu correo electrónico primero.';
//     } else {
//       this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
//     }
    
//     setTimeout(() => {
//       this.errorMessage = '';
//     }, 1500);
//   }
  
//   register() {
//     const userMail = this.userMail?.value;
//     localStorage.setItem('swapUserMail', userMail);
//     this.router.navigate(['/register']);
//   }
// }

