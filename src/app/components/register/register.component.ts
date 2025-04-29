import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
const supabase = createClient(environment.apiUrl, environment.publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'sb-auth-xyz'
  }
});

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
  email: string = '';
  password: string = '';
  name: string = '';
  age: number = 0;
  selectedFile: File | null = null;
  showVerificationMessage: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private router: Router) {}
  ngOnInit() {
    const swapUserMail = localStorage.getItem('swapUserMail');
  if (swapUserMail) {
    this.email = swapUserMail;
  }   
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
async register() {
  this.isLoading = true;
  this.errorMessage = null;
  this.successMessage = null;

  try {
    if (this.age < 5 || this.age > 90) {
      this.errorMessage = 'Por favor, ingrese una edad válida (entre 1 y 120 años).';
      this.isLoading = false;
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: {
        data: {
          name: this.name,
          age: this.age
        }
      }
    });
    console.log('Respuesta de signUp:', data, error);

    if (error) {
      console.error('Error en signUp:', error);
      throw error;
    }

    let avatarUrl = null;
    if (this.selectedFile && data.user) {
      avatarUrl = await this.saveFile(data.user.id);
    }

    if (data.user) {
      await this.saveUserData(data.user, avatarUrl);
    }
    localStorage.removeItem('UserMailRegistered');
    localStorage.removeItem('UserPWDRegisted');
    localStorage.setItem('UserMailRegistered', this.email);
    localStorage.setItem('UserPWDRegisted', this.password);
    this.showVerificationMessage = true;
    this.successMessage = '¡Registro exitoso!';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
    
  } catch (error: any) {
    console.error('Error:', error);
    this.errorMessage = this.getErrorMessage(error);
  } finally {
    this.isLoading = false; 
  }
}


  private async saveUserData(user: User, avatarUrl: string | null) {
    const { error } = await supabase
      .from('users-data')
      .insert([
        { 
          authId: user.id, 
          name: this.name, 
          age: this.age,  
          avatarUrl: avatarUrl
        }
      ]);

    if (error) throw error;
  }

  private getErrorMessage(error: any): string {
    console.log("Error: ", error);
    if (error.message.includes('Password')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (error.message.includes('Unable to validate email')) {
      return 'El formato del correo electrónico es inválido';
    }
    if (error.message.includes('insert or update on table')) {
      return 'Este correo ya está registrado';
    }
    if (error.message.includes('The resource already exists')) {
      return 'Este correo ya está registrado';
    }
    return 'Error al registrar. Intente nuevamente.';
  }

  private async saveFile(userId: string): Promise<string | null> {
    if (!this.selectedFile) return null;

    const filePath = `users/${userId}/${this.selectedFile.name}`;
    
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(filePath, this.selectedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública del archivo
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}


// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { createClient, User } from '@supabase/supabase-js'
// import { environment } from '../../../environments/environment';
// import { CommonModule } from '@angular/common';
// //import { AuthService } from '../../services/auth.service';

// const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

// @Component({
//   standalone: true,
//   imports: [FormsModule, RouterLink, CommonModule],
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.scss'
// })
// export class RegisterComponent {
//   email: string = '';
// password: string;
// name: string = '';
// age: number = 0;
// avatarFile: File | null = null;
// selectedFile: any;
// showVerificationMessage: boolean = false;
// isLoading: boolean = false;
// errormessage: string | null = null;

// constructor(private router: Router) {
//   this.email = '';
//   this.password = '';
// }

// onFileSelected(event: any) {
//   this.selectedFile = event.target.files[0];
// }

// saveUserData(user: User) {
  
//   const avatarUrl = this.saveFile().then((data) => {
//     if (data) { 
      
//       supabase.from('users-data').insert([
//     { authId: user.id, name: this.name, age: this.age, avatarUrl: data.path  }
//   ]).then(({ data, error }) => {
//     if (error) {
//       console.error('Error:', error.message);
//     } else {
//       this.router.navigate(['/home']);
//     }
//   });
// }
// });

// }
// async saveFile() {
//   if (!this.avatarFile) {
//     console.error("No hay archivo seleccionado");
//         return null;
//       }
      
//       const { data, error } = await supabase
//       .storage
//       .from('images')
//       .upload(`users/${this.avatarFile.name}`, this.avatarFile, {
//         cacheControl: '3600',
//         upsert: false
//       });
      
//       if (error) {
//         console.error("Error subiendo el archivo:", error.message);
//         return null;
//       }
      
//       return data;
//     }    
//     register() {
//         supabase.auth.signUp({
//             email: this.email,
//             password: this.password,
//           }).then(({ data, error }) => {
//               if (error) {
//         console.error('Error:', error.message);
        
//       } else {
    
//         console.log('User registered:', data.user);
//         this.saveUserData(data.user!);
  
//       }
//     }
//     );
//      }
//   }
  
  
  // async register() {
  //   this.isLoading = true;
  //   this.errorMessage = null;

  //   try {
  //     const { data, error } = await supabase.auth.signUp({
  //       email: this.email,
  //       password: this.password,
  //       options: {
  //         data: {
  //           name: this.name,
  //           age: this.age
  //         }
  //       }
  //     });

  //     if (error) throw error;

  //     let avatarUrl = null;
  //     if (this.selectedFile && data.user) {
  //       avatarUrl = await this.saveFile(data.user.id);
  //     }

  //     if (data.user) {
  //       await this.saveUserData(data.user, avatarUrl);
  //     }

  //     this.showVerificationMessage = true;
      
  //   } catch (error: any) {
  //     console.error('Error:', error);
  //     this.errorMessage = this.getErrorMessage(error);
  //   } finally {
  //     this.isLoading = false; 
  //   }
  // }