import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { App } from './app';
describe('Aplicación', () => {
  it('muestra navegación y marca sin ofrecer administración al visitante', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Crear cuenta');
    expect(fixture.nativeElement.textContent).not.toContain('Administrar');
  });
});
