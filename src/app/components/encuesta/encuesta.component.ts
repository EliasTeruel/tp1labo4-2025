import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncuestaService } from '../../services/encuesta.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss'],
})
export class EncuestaComponent implements OnInit {
  encuestaForm: FormGroup;
  mensajeFinal: string = '';
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private encuestaService: EncuestaService
  ) {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [
        '',
        [Validators.required, Validators.min(18), Validators.max(99)],
      ],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8,10}$')]],
      estrellas: ['', Validators.required],
      juegosFavoritos: this.fb.array([], Validators.required),
      juegosAdd: ['', Validators.required],
    });
  }


  onCheckboxChange(e: any) {
    const juegosFavoritos: FormArray = this.encuestaForm.get('juegosFavoritos') as FormArray;

    if (e.target.checked) {
      juegosFavoritos.push(this.fb.control(e.target.value));
    } else {
      const index = juegosFavoritos.controls.findIndex(x => x.value === e.target.value);
      juegosFavoritos.removeAt(index);
    }
  }

  ngOnInit() {
    this.authService.userInfo$.subscribe((user) => {
      if (user) {
        console.log('Usuario cargado:', user);
      } else {
        console.log('Error al obtener la información del usuario');
      }
    });
  }

  async onSubmit() {
    if (this.encuestaForm.valid) {
      try {
        const respuestas = this.encuestaForm.value;
        await this.encuestaService.saveEncuesta(respuestas);
        this.mensajeFinal = 'Encuesta guardada exitosamente';
        this.encuestaForm.reset();
        (this.encuestaForm.get('juegosFavoritos') as FormArray).clear();
      } catch (error) {
        console.error('Error al guardar la encuesta:', error);
        this.mensajeFinal = 'Hubo un error al guardar la encuesta';
      }
    } else {
      this.encuestaForm.markAllAsTouched();
      this.mensaje = 'Por favor completa todos los campos correctamente';
    }
  }
}