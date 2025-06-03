import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Juego2048Component } from './juego2048/juego2048.component';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { PreguntadosComponent } from './preguntados/preguntados.component';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '2048', component: Juego2048Component },
      { path: 'ahorcado', component: AhorcadoComponent },
      { path: 'mayorMenor', component: MayorMenorComponent },
      { path: 'preguntados', component: PreguntadosComponent }
    ])
  ],
  exports: []
})
export class GamesModule { }
