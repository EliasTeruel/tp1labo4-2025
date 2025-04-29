import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
}