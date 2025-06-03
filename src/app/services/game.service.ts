import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartasService {

  private apiUrl = 'https://deckofcardsapi.com/api/deck';

  constructor(private http: HttpClient) {}

  crearMazo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/new/shuffle/?deck_count=1`);
  }

  sacarCarta(deck_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${deck_id}/draw/?count=1`);
  }
}
