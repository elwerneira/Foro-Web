import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';
import { ForoStore } from './foro-store';
describe('Accesos a las pantallas', () => {
  it('redirige al visitante que intenta publicar', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/temas/nuevo');
    expect(h.routeNativeElement?.textContent).toContain('Iniciar sesión');
  });
  it('impide entrar a administración con rol Usuario', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(ForoStore).login('ana@foro.cl', 'AnaDemo2026!');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/administracion');
    expect(h.routeNativeElement?.textContent).toContain(
      'Todas las conversaciones',
    );
  });
  it('permite entrar a administración con rol Admin', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(ForoStore).login('admin@foro.cl', 'AdminDemo2026!');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/administracion');
    expect(h.routeNativeElement?.textContent).toContain('Acceso Administrador');
  });
});
