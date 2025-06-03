import { Component, OnInit } from '@angular/core';
import { CartasService } from '../../../services/game.service';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../../../services/score.service';

@Component({
  imports: [CommonModule],
  selector: 'app-mayormenor',
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.scss'
})

export class MayorMenorComponent implements OnInit {

  cartas: any[] = [];
  cartaActual: any = null;
  deckId: string = '';
  mensajeFinal: string = '';
  score: number = 0;
  loading: boolean = true;
  imageLoading: boolean = true;
  bestScore: number = 0;
  gameOver: boolean = false;

  constructor(private cartasService: CartasService, private scoreService: ScoreService) { }
  async ngOnInit(): Promise<void> {
    await this.loadUserBestScore();
    this.iniciarJuego();
  }
  async loadUserBestScore() {
    const email = localStorage.getItem('savedUserMail');
    if (!email) {
      console.warn('No se encontró email en localStorage');
      this.bestScore = 0;
      return;
    }

    try {
      const scores = await this.scoreService.getScoresByGame('mayor-menor');
      const userScore = scores.find(score => score.email === email);
      this.bestScore = userScore?.score || 0;
    } catch (error) {
      console.error('Error al cargar mejor puntuación:', error);
      this.bestScore = 0;
    }
  }
  iniciarJuego(): void {
    this.gameOver = false;
    this.loading = true;
    this.cartasService.crearMazo().subscribe(data => {
      if (data && data.deck_id) {
        this.deckId = data.deck_id;
        this.sacarCarta();
      } else {
        console.error('No se obtuvo un deck_id ', data);
        this.loading = false;
      }
    }, error => {
      console.error('Error al crear el mazo:', error);
      this.loading = false;
    });
  }

  sacarCarta(): void {
    if (!this.deckId) {
      console.error('No se inicialiso el deckId');
      this.loading = false;
      return;
    }
    this.imageLoading = true;
    this.cartasService.sacarCarta(this.deckId).subscribe(data => {
      if (data && data.cards && data.cards.length > 0) {
        const nuevaCarta = data.cards[0];
        this.cartas.push(nuevaCarta);
        this.cartaActual = nuevaCarta;
      } else {
        console.error('No se obtuvieron cartas:', data);
      }
      this.loading = false;
    }, error => {
      console.error('Error al sacar carta:', error);
      this.loading = false;
      this.imageLoading = false;
    });
  }

  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError() {
    this.imageLoading = false;
    console.error('Error al cargar la imagen de la carta');
  }
  adivinar(eleccion: string) {
    if (this.gameOver) return;
    if (this.cartas.length < 52) {
      this.loading = true;
      this.cartasService.sacarCarta(this.deckId).subscribe(data => {
        const cartaSiguiente = data.cards[0];
        const valorActual = this.obtenerValorCarta(this.cartaActual);
        const valorSiguiente = this.obtenerValorCarta(cartaSiguiente);
        this.score++;

        if ((eleccion === 'mayor' && valorSiguiente > valorActual) ||
          (eleccion === 'menor' && valorSiguiente < valorActual)) {
          this.score++;
          if (this.score > this.bestScore) {
            this.saveCurrentScore();
          }
          this.cartas.push(cartaSiguiente);
          this.cartaActual = cartaSiguiente;
          this.mensajeFinal = '';
        } else {
          this.gameOver = true;
          this.mensajeFinal = 'Perdiste! La carta era: ' + cartaSiguiente.value + ` Tu puntuación fue: ${this.score}`;
          if (this.score >= this.bestScore) {
            this.saveCurrentScore();
          }
          this.loadUserBestScore();
        }
        this.loading = false;
      });
    } else {
      this.gameOver = true;
      this.score++;
      this.mensajeFinal = 'Ganaste! Has llegado al final.';

      if (this.score >= this.bestScore) {
        this.saveCurrentScore();
      }
      this.loadUserBestScore();
    }
  }

  obtenerValorCarta(carta: any): number {
    const valoresCartas: any = {
      'ACE': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'JACK': 11,
      'QUEEN': 12,
      'KING': 13
    };
    return valoresCartas[carta.value];
  }

  async saveCurrentScore(): Promise<boolean> {
    const email = localStorage.getItem('savedUserMail');
    if (!email) {
      console.error('No se encontró email en localStorage');
      return false;
    }

    try {
      const saved = await this.scoreService.saveUserScore(
        email,
        this.score,
        'mayor-menor'
      );

      if (saved) {
        this.bestScore = this.score;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar puntuación:', error);
      return false;
    }
  }

  reiniciarJuego() {
    this.cartas = [];
    this.cartaActual = null;
    this.mensajeFinal = '';
    this.score = 0;
    this.gameOver = false;
    this.loadUserBestScore();
    this.iniciarJuego();
  }
}
