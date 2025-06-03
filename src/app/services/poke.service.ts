import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, delayWhen, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SimpsonsService {
  private apiUrl = 'https://thesimpsonsquoteapi.glitch.me/quotes';
  private maxRetries = 8;
  private initialDelay = 2000;

  constructor(private http: HttpClient) {}

  getRandomCharacter(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?count=1`).pipe(
      retryWhen(errors => errors.pipe(
        delayWhen((error, retryCount) => {
          if (retryCount >= this.maxRetries) {
            return throwError(() => error);
          }
          const delay = this.initialDelay * (retryCount + 1);
          console.log(`Intento ${retryCount + 1}: Reintentando en ${delay}ms`);
          return timer(delay);
        })
      )),
      catchError(error => {
        console.error('Error después de reintentos:', error);
        return throwError(() => error);
      })
    );
  }
}