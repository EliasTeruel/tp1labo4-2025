import { Component } from '@angular/core';
import { ScoreService } from '../../../services/score.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-juego2048',
  templateUrl: './juego2048.component.html',
  styleUrls: ['./juego2048.component.scss']
})
export class Juego2048Component {
  board: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  score: number = 0;
  bestScore: number = 0;
  gameOver: boolean = false;
  gameWon: boolean = false;
  ranking: any[] = [];
  rankingVisible: boolean = false;

  constructor(private scoreService: ScoreService) {
    this.loadUserBestScore();
    this.inicializarJuego();

  }

  async loadUserBestScore() {
    const email = localStorage.getItem('savedUserMail');
    if (!email) {
      console.warn('No se encontró email en localStorage');
      this.bestScore = 0;
      return;
    }

    try {
      const scores = await this.scoreService.getScoresByGame('juego-2048');
      const userScore = scores.find(score => score.email === email);
      this.bestScore = userScore?.score || 0;
    } catch (error) {
      console.error('Error al cargar mejor puntuación:', error);
      this.bestScore = 0;
    }
  }



  inicializarJuego() {
    this.score = 0;
    this.board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    this.addNewTile();
    this.addNewTile();
    this.gameOver = false;
  this.gameWon = false;
  }

  addNewTile() {
    let emptyCells: { x: number, y: number }[] = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randIndex = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells[randIndex];
      this.board[cell.x][cell.y] = Math.random() < 0.9 ? 2 : 4;

      setTimeout(() => {
        const newTile = document.querySelector(`.row:nth-child(${cell.x + 1}) .cell:nth-child(${cell.y + 1})`);
        if (newTile) {
          newTile.classList.add('new-tile');
          setTimeout(() => newTile.classList.add('active'), 10);
        }
      }, 10);
    }
  }

  move(direction: string) {
    if (this.gameOver || this.gameWon) return;
    this.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellElement = document.querySelector(`.row:nth-child(${rowIndex + 1}) .cell:nth-child(${colIndex + 1})`);
        if (cellElement) {
          cellElement.classList.add('moving');
        }
      });
    });

    setTimeout(() => {
      let boardChanged = false;

      switch (direction) {
        case 'up':
          boardChanged = this.moveUp();
          break;
        case 'down':
          boardChanged = this.moveDown();
          break;
        case 'left':
          boardChanged = this.moveLeft();
          break;
        case 'right':
          boardChanged = this.moveRight();
          break;
      }

      setTimeout(() => {
        this.board.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const cellElement = document.querySelector(`.row:nth-child(${rowIndex + 1}) .cell:nth-child(${colIndex + 1})`);
            if (cellElement) {
              cellElement.classList.remove('moving');
            }
          });
        });

        if (boardChanged) {
          this.addNewTile();

          if (this.checkWinCondition() && !this.gameWon) {
            this.gameWon = true;
            this.saveCurrentScore();
          }

          if (this.checkGameOver()) {
            this.gameOver = true;
            this.saveCurrentScore();
          }
        }
      }, 300);
    }, 10);
  }


  combine(rowOrCol: number[]) {




    for (let i = 0; i < rowOrCol.length - 1; i++) {
      if (rowOrCol[i] !== 0 && rowOrCol[i] === rowOrCol[i + 1]) {
        rowOrCol[i] *= 2;
        rowOrCol[i + 1] = 0;
        this.score += rowOrCol[i];
      }
    }
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveCurrentScore();
    }
    return rowOrCol;
  }

  slide(rowOrCol: number[]) {
    const nonZeroTiles = rowOrCol.filter(tile => tile !== 0);
    const zeros = new Array(4 - nonZeroTiles.length).fill(0);
    return [...nonZeroTiles, ...zeros];
  }

  moveUp() {
    let boardChanged = false;
    for (let col = 0; col < 4; col++) {
      let column = [this.board[0][col], this.board[1][col], this.board[2][col], this.board[3][col]];
      let original = [...column];
      column = this.slide(column);
      column = this.combine(column);
      column = this.slide(column);
      for (let row = 0; row < 4; row++) {
        this.board[row][col] = column[row];
      }
      if (column.toString() !== original.toString()) boardChanged = true;
    }
    return boardChanged;
  }

  moveDown() {
    let boardChanged = false;
    for (let col = 0; col < 4; col++) {
      let column = [this.board[3][col], this.board[2][col], this.board[1][col], this.board[0][col]];
      let original = [...column];
      column = this.slide(column);
      column = this.combine(column);
      column = this.slide(column);
      for (let row = 0; row < 4; row++) {
        this.board[3 - row][col] = column[row];
      }
      if (column.toString() !== original.toString()) boardChanged = true;
    }
    return boardChanged;
  }

  moveLeft() {
    let boardChanged = false;
    for (let row = 0; row < 4; row++) {
      let rowArray = [...this.board[row]];
      let original = [...rowArray];
      rowArray = this.slide(rowArray);
      rowArray = this.combine(rowArray);
      rowArray = this.slide(rowArray);
      this.board[row] = rowArray;
      if (rowArray.toString() !== original.toString()) boardChanged = true;
    }
    return boardChanged;
  }

  moveRight() {
    let boardChanged = false;
    for (let row = 0; row < 4; row++) {
      let rowArray = [...this.board[row]].reverse();
      let original = [...rowArray];
      rowArray = this.slide(rowArray);
      rowArray = this.combine(rowArray);
      rowArray = this.slide(rowArray);
      this.board[row] = rowArray.reverse();
      if (rowArray.toString() !== original.toString()) boardChanged = true;
    }
    return boardChanged;
  }
  checkWinCondition(): boolean {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  }

  checkGameOver(): boolean {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === 0) return false;
      }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === this.board[i][j + 1]) return false;
      }
    }

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        if (this.board[i][j] === this.board[i + 1][j]) return false;
      }
    }

    return true;
  }
  //   checkGameOver() {
  //     for (let i = 0; i < 4; i++) {
  //       for (let j = 0; j < 4; j++) {
  //         if (this.board[i][j] === 0) return false;
  //         if (i < 3 && this.board[i][j] === this.board[i + 1][j]) return false;
  //         if (j < 3 && this.board[i][j] === this.board[i][j + 1]) return false;
  //       }
  //     }

  // //    this.scoreService.saveScore(this.score).then(() => {
  //     console.log('Puntuación guardada:', this.score);
  //   //}).catch(error => {
  //     //console.error('Error al guardar la puntuación:', error);
  //  // });
  //     return true;
  //   }
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
        'juego-2048'
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



setNearWinBoard() {
  // Deja el tablero con dos fichas de 1024 juntas y el resto vacío
  this.board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1024, 1024, 0, 0]
  ];
  this.score = 0;
  this.gameOver = false;
  this.gameWon = false;
}

setNearLoseBoard() {
  // Tablero lleno, sin pares adyacentes iguales (ningún movimiento posible)
  this.board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  ];
  this.score = 0;
  this.gameOver = false;
  this.gameWon = false;
}

}

