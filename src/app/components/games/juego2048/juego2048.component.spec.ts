import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Juego2048Component } from './juego2048.component';

describe('Juego2048Component', () => {
  let component: Juego2048Component;
  let fixture: ComponentFixture<Juego2048Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Juego2048Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Juego2048Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
