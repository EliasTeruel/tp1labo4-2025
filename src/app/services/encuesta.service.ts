import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  constructor(private supabaseService: SupabaseService) { }

  async saveEncuesta(data: any): Promise<void> {
    const encuestaData = {
      nombre: data.nombre,
      apellido: data.apellido,
      edad: data.edad,
      telefono: data.telefono,
      estrellas: data.estrellas,
      juegos_favoritos: data.juegosFavoritos,
      juego_a_agregar: data.juegosAdd,
      usuario_email: localStorage.getItem('savedUserMail')
    };

    const { error } = await this.supabaseService.client
      .from('encuestas')
      .insert(encuestaData);

    if (error) {
      console.error('Error al guardar la encuesta:', error);
      throw error;
    }
  }
}