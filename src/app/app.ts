import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ForoStore } from './foro-store';
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: ` <a class="skip" href="#principal">Saltar al contenido</a>
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand" aria-label="Entre Líneas, inicio"
          ><img src="/marca.svg" alt="" width="36" height="36" /><span
            >entre<span class="brand-light">líneas</span
            ><small>UN ESPACIO PARA COMPARTIR</small></span
          ></a
        >
        <nav aria-label="Navegación principal">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Explorar</a
          >
          @if (store.actual(); as user) {
            @if (user.rol === 'ADMIN') {
              <a routerLink="/administracion" routerLinkActive="active"
                >Administrar</a
              >
            }
            <a
              routerLink="/perfil"
              routerLinkActive="active"
              class="profile-link"
              ><span class="avatar small">{{ user.nombre.charAt(0) }}</span
              ><span>{{ user.nombre.split(' ')[0] }}</span></a
            >
            <button class="btn btn-sm btn-outline-secondary" (click)="salir()">
              Salir
            </button>
          } @else {
            <a routerLink="/ingresar" routerLinkActive="active">Ingresar</a
            ><a class="btn btn-dark btn-sm" routerLink="/registro"
              >Crear cuenta</a
            >
          }
        </nav>
      </div>
    </header>
    <main id="principal" class="container main-content"><router-outlet /></main>
    <footer class="container site-footer">
      <span
        >entre<strong>líneas</strong> <span class="dot">·</span> Conversaciones
        que conectan.</span
      ><span>Demo académica · Datos locales que se reinician al recargar.</span>
    </footer>`,
})
export class App {
  readonly store = inject(ForoStore);
  private router = inject(Router);
  salir() {
    this.store.salir();
    this.router.navigateByUrl('/');
  }
}
