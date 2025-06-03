import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userInfoSubject = new BehaviorSubject<any>(null);
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('savedUserMail');
    if (savedUser) {
      this.userInfoSubject.next({ email: savedUser });
    }
  }

  register(userData: any) {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('name', userData.name);
    formData.append('age', userData.age.toString());
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    return this.http.post(`${this.apiUrl}/auth/register`, formData);
  }

  resendVerificationEmail(email: string) {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email });
  }

  setUserInfo(email: string) {
    localStorage.setItem('savedUserMail', email);
    this.userInfoSubject.next({ email });
  }

  clearUserInfo() {
    localStorage.removeItem('savedUserMail');
    this.userInfoSubject.next(null);
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('savedUserMail');
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) {}

//   register(userData: any) {
//     const formData = new FormData();
//     formData.append('email', userData.email);
//     formData.append('password', userData.password);
//     formData.append('name', userData.name);
//     formData.append('age', userData.age.toString());
//     if (userData.avatar) {
//       formData.append('avatar', userData.avatar);
//     }

//     return this.http.post(`${this.apiUrl}/auth/register`, formData);
//   }

//   resendVerificationEmail(email: string) {
//     return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email });
//   }
// }