import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ForoStore } from '../foro-store';
@Component({
  imports: [RouterLink, DatePipe],
  template: ` <section class="hero">
      <div>
        <span class="eyebrow">TU COMUNIDAD, TU CONVERSACIÓN</span>
        <h1>Las buenas ideas<br />empiezan compartiendo.</h1>
        <p>
          Un libro, una pregunta o algo que descubriste.<br
            class="d-none d-md-block"
          />
          Siempre hay alguien con quien conversarlo.
        </p>
        <a
          class="btn btn-dark"
          [routerLink]="store.actual() ? '/temas/nuevo' : '/registro'"
          >Empezar una conversación <span aria-hidden="true">↗</span></a
        >
      </div>
      <img
        src="/lecturas.svg"
        alt="Libros y una planta, ilustración de nuestra comunidad"
        class="hero-art"
      />
    </section>
    <div class="row g-4">
      <aside class="col-12 col-md-4 col-lg-3">
        <div class="panel category-panel">
          <h2 class="section-label">EXPLORA POR CATEGORÍA</h2>
          <button
            class="category-button"
            [class.selected]="categoria() === 0"
            (click)="categoria.set(0)"
          >
            <span class="category-icon green">✳</span
            ><span>Todas las conversaciones</span
            ><span class="count">{{ visibles().length }}</span>
          </button>
          @for (c of store.estado().categorias; track c.id) {
            <button
              class="category-button"
              [class.selected]="categoria() === c.id"
              (click)="categoria.set(c.id)"
            >
              <span
                class="category-icon"
                [class]="'category-icon ' + c.color"
                >{{ c.nombre.charAt(0) }}</span
              ><span>{{ c.nombre }}</span>
            </button>
          }
        </div>
        <div class="community-note">
          <span class="eyebrow">UN BUEN LUGAR PARA ESTAR</span>
          <h3>Conversemos con respeto.</h3>
          <p>
            Comparte ideas, escucha otras miradas y evita publicar información
            personal.
          </p>
          <a routerLink="/registro">Sé parte de la comunidad →</a>
        </div>
      </aside>
      <section class="col-12 col-md-8 col-lg-9" aria-label="Conversaciones">
        <div class="section-top">
          <div>
            <span class="eyebrow">LO QUE ESTAMOS CONVERSANDO</span>
            <h2>
              {{
                categoria()
                  ? store.categoria(categoria())?.nombre
                  : 'Todas las conversaciones'
              }}
            </h2>
          </div>
          <a
            class="btn btn-dark btn-sm"
            [routerLink]="store.actual() ? '/temas/nuevo' : '/ingresar'"
            >+ Nuevo tema</a
          >
        </div>
        <label class="search-box"
          ><span aria-hidden="true">⌕</span
          ><input
            class="form-control"
            aria-label="Buscar conversaciones"
            placeholder="Buscar una conversación…"
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
        /></label>
        <div class="results-meta">
          <span>{{ temas().length }} conversaciones</span
          ><span>Más recientes primero</span>
        </div>
        @for (t of temas(); track t.id) {
          <article class="topic-card">
            <div class="topic-main">
              <span
                class="tag"
                [class]="'tag ' + store.categoria(t.categoriaId)?.color"
                >{{ store.categoria(t.categoriaId)?.nombre }}</span
              >
              <h3>
                <a [routerLink]="['/temas', t.id]">{{ t.titulo }}</a>
              </h3>
              <p>{{ t.contenido }}</p>
              <div class="topic-meta">
                <span class="avatar small">{{
                  store.autor(t.autorId).charAt(0)
                }}</span
                ><span>{{ store.autor(t.autorId) }}</span
                ><span>·</span><time>{{ t.fecha | date: 'dd/MM/yyyy' }}</time>
              </div>
            </div>
            <a
              class="reply-count"
              [routerLink]="['/temas', t.id]"
              [attr.aria-label]="'Abrir ' + t.titulo"
              ><strong>{{ respuestas(t.id) }}</strong
              ><span>respuestas</span></a
            >
          </article>
        } @empty {
          <div class="panel empty">
            <h3>No encontramos conversaciones.</h3>
            <p>
              Prueba otra búsqueda o comparte el primer tema de esta categoría.
            </p>
            <button
              class="btn btn-outline-dark"
              (click)="busqueda.set(''); categoria.set(0)"
            >
              Ver todas
            </button>
          </div>
        }
      </section>
    </div>`,
})
export class Inicio {
  readonly store = inject(ForoStore);
  readonly categoria = signal(0);
  readonly busqueda = signal('');
  readonly visibles = computed(() =>
    this.store.estado().temas.filter((t) => !t.oculto),
  );
  readonly temas = computed(() => {
    const q = this.busqueda().trim().toLocaleLowerCase();
    return this.visibles()
      .filter(
        (t) =>
          (!this.categoria() || t.categoriaId === this.categoria()) &&
          (!q ||
            (t.titulo + ' ' + t.contenido).toLocaleLowerCase().includes(q)),
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });
  respuestas(id: number) {
    return this.store
      .estado()
      .comentarios.filter((c) => c.temaId === id && !c.oculto).length;
  }
}
