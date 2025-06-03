import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ScoreService } from '../../../services/score.service';

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.scss']
})
export class AhorcadoComponent implements OnInit {
  palabraSecreta: string = '';
  palabraMostrada: string[] = [];
  letrasIncorrectas: string[] = [];
  intentosRestantes: number = 6;
  letrasAdivinadas: string[] = [];
  juegoTerminado: boolean = false;
  mensajeFinal: string = '';
  score: number = 0;
  bestScore: number = 0;
  listaPalabras: string[] = ['ANGULAR', 'PROGRAMACION', 'HOLA'];
  gano: boolean = false;

  constructor(private scoreService: ScoreService) { }

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
      const scores = await this.scoreService.getScoresByGame('ahorcado');
      const userScore = scores.find(score => score.email === email);
      this.bestScore = userScore?.score || 0;
    } catch (error) {
      console.error('Error al cargar mejor puntuación:', error);
      this.bestScore = 0;
    }
  }

  iniciarJuego() {
    this.palabraSecreta = this.generarPalabraSecreta();
    this.palabraMostrada = Array(this.palabraSecreta.length).fill('_');
    this.letrasIncorrectas = [];
    this.intentosRestantes = 6;
    this.juegoTerminado = false;
    this.mensajeFinal = '';
    this.letrasAdivinadas = [];
    this.score = 0;
  }

  generarPalabraSecreta(): string {
    const indiceAleatorio = Math.floor(Math.random() * this.listaPalabras.length);
    return this.listaPalabras[indiceAleatorio];
  }

  adivinarLetra(letra: string) {
    if (this.juegoTerminado || this.letrasAdivinadas.includes(letra)) {
      return;
    }

    this.letrasAdivinadas.push(letra);

    if (this.palabraSecreta.includes(letra)) {
      this.palabraSecreta.split('').forEach((l, index) => {
        if (l === letra) {
          this.palabraMostrada[index] = letra;
        }
      });
      this.score += 10;
    } else {
      this.letrasIncorrectas.push(letra);
      this.intentosRestantes--;
      this.score = Math.max(0, this.score - 5);
    }

    this.verificarEstadoDelJuego();
  }

  async verificarEstadoDelJuego() {
    if (!this.palabraMostrada.includes('_')) {
      this.score += this.intentosRestantes * 20;
      this.juegoTerminado = true;
      this.gano = true;
      this.mensajeFinal = `¡Ganaste! Puntuación: ${this.score}`;

      if (this.score > this.bestScore) {
        await this.saveCurrentScore();
      }
    } else if (this.intentosRestantes <= 0) {
      this.juegoTerminado = true;
      this.gano = false;
      this.mensajeFinal = `¡Perdiste! La palabra era: ${this.palabraSecreta}`;

      if (this.score > this.bestScore) {
        await this.saveCurrentScore();
      }
    }
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
        'ahorcado'
      );

      if (saved) {
        await this.loadUserBestScore();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar puntuación:', error);
      return false;
    }
  }
  async reiniciarJuego() {
    this.iniciarJuego();
    this.gano = false;
  }
}

