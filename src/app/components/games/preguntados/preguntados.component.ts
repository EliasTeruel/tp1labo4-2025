import { Component, OnInit } from '@angular/core';
import { SimpsonsService } from '../../../services/poke.service';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../../../services/score.service';

@Component({
  imports: [CommonModule],
  selector: 'app-preguntados',
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.scss']
})
export class PreguntadosComponent implements OnInit {
  character: any;
  options: string[] = [];
  correctAnswer: string = '';
  score: number = 0;
  selectedAnswer: string | null = null;
  loading: boolean = true;
  lives: number = 3;
  gameOverMessage: string | null = null;
  bestScore: number = 0;
  imageLoading: boolean = true;

  constructor(
    private simpsonsService: SimpsonsService,
    private scoreService: ScoreService
  ) { }

  async ngOnInit() {
    await this.loadUserBestScore();
    this.loadNewCharacter();
  }
  async loadUserBestScore() {
    console.log('Cargando mejor puntuación del usuario');
    const email = localStorage.getItem('savedUserMail');
    if (!email) {
      console.warn('No se encontró email en localStorage');
      this.bestScore = 0;
      return;
    }

    try {
      console.log(`Buscando puntuaciones para: ${email}`);
      const scores = await this.scoreService.getScoresByGame('preguntados');
      console.log('Todas las puntuaciones:', scores);

      const userScore = scores.find(score => score.email === email);
      console.log('Puntuación encontrada:', userScore);

      this.bestScore = userScore?.score || 0;
      console.log('Mejor puntuación establecida:', this.bestScore);
    } catch (error) {
      console.error('Error en loadUserBestScore:', error);
      this.bestScore = 0;
    }
  }


  loadNewCharacter() {
    this.loading = true;
    this.imageLoading = true;
    this.gameOverMessage = null;
    this.simpsonsService.getRandomCharacter().subscribe(data => {
      const characterData = data[0];
      this.character = characterData;
      this.correctAnswer = characterData.character;
      this.generateOptions(characterData.character);
      this.selectedAnswer = null;
      this.loading = false;
    }, () => {
      this.loading = false;
      this.imageLoading = false;
    });
  }
  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError() {
    this.imageLoading = false;
    console.error('Error al cargar la imagen');
  }
  generateOptions(correctName: string) {
    this.options = [correctName];
    const additionalOptions = ["Otro", "Lisa Simpson", "Marge Simpson", "Troy McClure", "Ned Flanders", "Mr. Burns", "Apu Nahasapeemapetilon", "Krusty the Clown", "Sideshow Bob", "Milhouse Van Houten", "Chief Wiggum", "Edna Krabappel", "Patty Bouvier", "Selma Bouvier", "Waylon Smithers", "Carl Carson", "Lenny Leonard", "Squeaky Voiced Teen", "Ralph Wiggum", "Groundskeeper Willie", "Comic Book Guy", "Agnes Skinner", "Dr. Hibbert", "Cletus Spuckler", "Squeaky-Voiced Teen", "Patty and Selma Bouvier", "Lard Lad", "Mr. Teeny", "Porky Pig"];
    this.options = [...this.options, ...additionalOptions]
      .slice(0, 4);
    this.options = this.shuffleArray(this.options);
    this.loading = false;
  }

  shuffleArray(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }





  async checkAnswer(selectedOption: string) {
    this.selectedAnswer = selectedOption;

    if (selectedOption === this.correctAnswer) {
      this.score++;
      console.log('Respuesta correcta! Puntuación actual:', this.score);

      if (this.score > this.bestScore) {
        console.log('¡Superando récord durante el juego!');
        await this.saveCurrentScore();
      }
    } else {
      this.lives--;
      console.log('Respuesta incorrecta. Vidas restantes:', this.lives);
    }

    if (this.lives <= 0) {
      console.log('Juego terminado. Puntuación final:', this.score);
      this.gameOverMessage = `Perdiste! la puntuación fue: ${this.score}`;
      this.selectedAnswer = null;

      try {
        if (this.score >= this.bestScore) {
          console.log('Intentando guardar puntuación final...');
          await this.saveCurrentScore();
        }
        await this.loadUserBestScore();
      } catch (error) {
        console.error('Error al guardar puntuación:', error);
      }
    } else {
      setTimeout(() => this.loadNewCharacter(), 2000);
    }
  }

  async saveCurrentScore(): Promise<boolean> {
    const email = localStorage.getItem('savedUserMail');
    if (!email) {
      console.error('No se encontró email en localStorage');
      return false;
    }

    console.log(`Intentando guardar puntuación: ${this.score}`);
    try {
      const saved = await this.scoreService.saveUserScore(email, this.score, 'preguntados');

      if (saved) {
        console.log('Puntuación guardada exitosamente');
        this.bestScore = this.score;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar puntuación:', error);
      return false;
    }
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.loadNewCharacter();
  }
}