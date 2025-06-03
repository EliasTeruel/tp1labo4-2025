import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map, Observable } from 'rxjs';

export interface UserScore {
  email: string;
  score: number;
  game: string;
  date?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private tableName = 'user_scores';

  constructor(private supabaseService: SupabaseService) { }

  async getScoresByGame(game: string): Promise<UserScore[]> {
    console.log(`Obteniendo puntuaciones para el juego: ${game}`);
    try {
      const { data, error } = await this.supabaseService.client
        .from(this.tableName)
        .select('*')
        .eq('game', game)
        .order('score', { ascending: false });

      if (error) {
        console.error('Error al obtener las puntuaciones:', error);
        throw error;
      }

      console.log('Puntuaciones obtenidas:', data);
      return data as UserScore[];
    } catch (error) {
      console.error('Error en getScoresByGame:', error);
      return [];
    }
  }

  async saveUserScore(email: string, score: number, game: string): Promise<boolean> {
    console.log(`Intentando guardar puntuación - Email: ${email}, Score: ${score}, Game: ${game}`);
    try {
      const { data: existingScore, error: queryError } = await this.supabaseService.client
        .from(this.tableName)
        .select('score')
        .eq('email', email)
        .eq('game', game)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error('Error al verificar puntuación existente:', queryError);
        throw queryError;
      }

      console.log('Puntuación existente:', existingScore?.score);

      if (!existingScore || score >= existingScore.score) {
        console.log('Guardando/actualizando puntuación');
        const { error: upsertError } = await this.supabaseService.client
          .from(this.tableName)
          .upsert(
            {
              email,
              score,
              game,
              date: new Date().toISOString()
            },
            { onConflict: 'email,game' }
          );

        if (upsertError) {
          console.error('Error al guardar el puntaje:', upsertError);
          throw upsertError;
        }

        console.log('Puntuación guardada exitosamente');
        return true;
      }

      console.log('No se actualiza porque existe una puntuación mayor:', existingScore.score);
      return false;
    } catch (error) {
      console.error('Error en saveUserScore:', error);
      throw error;
    }
  }




  async updateUserScore(email: string, points: number, game: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('score')
      .eq('email', email)
      .eq('game', game)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error al obtener el score actual:', error);
      return;
    }

    const currentScore = data?.score || 0;
    const newScore = currentScore + points;

    const { error: updateError } = await this.supabaseService.client
      .from(this.tableName)
      .upsert({ email, score: newScore, game }, { onConflict: 'email,game' });

    if (updateError) {
      console.error('Error al actualizar el score:', updateError);
      throw updateError;
    }
  }

  getAllScoresByGame(game: string): Observable<UserScore[]> {
    return from(
      this.supabaseService.client
        .from(this.tableName)
        .select('*')
        .eq('game', game)
        .order('score', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error al obtener scores por juego:', error);
          return [];
        }
        return data as UserScore[];
      })
    );
  }

  getUserRank(email: string, game: string): Observable<number> {
    return this.getAllScoresByGame(game).pipe(
      map((scores) => {
        const index = scores.findIndex((score) => score.email === email);
        return index >= 0 ? index + 1 : -1;
      })
    );
  }
}