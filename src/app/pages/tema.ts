import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForoStore } from '../foro-store';
import { texto } from '../validaciones';
@Component({
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  template: `<a class="back-link" routerLink="/">← Todas las conversaciones</a>
    @if (tema(); as t) {
      <article class="panel detail-panel">
        <span [class]="'tag ' + store.categoria(t.categoriaId)?.color">{{
          store.categoria(t.categoriaId)?.nombre
        }}</span>
        <h1>{{ t.titulo }}</h1>
        <div class="topic-meta">
          <span class="avatar small">{{
            store.autor(t.autorId).charAt(0)
          }}</span
          >{{ store.autor(t.autorId) }}<span>·</span
          >{{ t.fecha | date: 'dd/MM/yyyy HH:mm' }}
        </div>
        <p class="body-text">{{ t.contenido }}</p>
        @if (store.puedeEditar(t.autorId)) {
          <div class="d-flex gap-2 flex-wrap">
            <a
              class="btn btn-outline-dark btn-sm"
              [routerLink]="['/temas', t.id, 'editar']"
              >Editar tema</a
            ><button
              class="btn btn-outline-danger btn-sm"
              (click)="confirmarTema.set(true)"
            >
              Eliminar tema
            </button>
          </div>
        }
        @if (confirmarTema()) {
          <div class="alert alert-warning mt-3">
            <p>¿Eliminar este tema? Debe estar sin comentarios.</p>
            <button class="btn btn-danger btn-sm me-2" (click)="eliminarTema()">
              Confirmar eliminación</button
            ><button
              class="btn btn-outline-dark btn-sm"
              (click)="confirmarTema.set(false)"
            >
              Cancelar
            </button>
          </div>
        }
      </article>
      @if (error()) {
        <p class="alert alert-danger mt-3" role="alert">{{ error() }}</p>
      }
      <section class="comments-section">
        <h2>{{ comentarios().length }} respuestas</h2>
        @for (c of comentarios(); track c.id) {
          <article class="panel comment-card">
            <div class="topic-meta">
              <span class="avatar small">{{
                store.autor(c.autorId).charAt(0)
              }}</span
              ><strong>{{ store.autor(c.autorId) }}</strong
              ><time>{{ c.fecha | date: 'dd/MM/yyyy HH:mm' }}</time>
            </div>
            <p class="body-text">{{ c.contenido }}</p>
            @if (store.puedeEditar(c.autorId)) {
              <button
                class="text-button"
                (click)="editarComentario(c.id, c.contenido)"
              >
                Editar</button
              ><button
                class="text-button danger"
                (click)="confirmarComentario.set(c.id)"
              >
                Eliminar
              </button>
            }
            @if (confirmarComentario() === c.id) {
              <div class="mt-2">
                <span>¿Eliminar comentario? </span
                ><button
                  class="btn btn-danger btn-sm"
                  (click)="eliminarComentario(c.id)"
                >
                  Confirmar</button
                ><button
                  class="btn btn-sm"
                  (click)="confirmarComentario.set(0)"
                >
                  Cancelar
                </button>
              </div>
            }
          </article>
        } @empty {
          <p class="muted">
            Todavía no hay respuestas. Puedes abrir la conversación.
          </p>
        }
        @if (store.actual()) {
          <div class="panel">
            <h3>{{ edicion() ? 'Editar respuesta' : 'Suma tu respuesta' }}</h3>
            <form [formGroup]="form" (ngSubmit)="comentar()" novalidate>
              <label for="comentario">Comentario</label
              ><textarea
                id="comentario"
                class="form-control"
                formControlName="contenido"
                rows="4"
                maxlength="2000"
                placeholder="Comparte tu punto de vista con respeto…"
              ></textarea>
              @if (form.invalid && form.touched) {
                <p class="field-error">
                  Escribe entre 2 y 2000 caracteres, no solo espacios.
                </p>
              }
              <button class="btn btn-dark mt-3" type="submit">
                {{ edicion() ? 'Guardar respuesta' : 'Publicar respuesta' }}
              </button>
              @if (edicion()) {
                <button
                  class="btn btn-link"
                  type="button"
                  (click)="cancelarEdicion()"
                >
                  Cancelar edición
                </button>
              }
            </form>
          </div>
        } @else {
          <div class="panel">
            <a routerLink="/ingresar">Inicia sesión</a> para participar en esta
            conversación.
          </div>
        }
      </section>
    } @else {
      <div class="panel empty">
        <h1>Tema no disponible</h1>
        <p>No existe o fue retirado por moderación.</p>
        <a routerLink="/" class="btn btn-dark">Volver al foro</a>
      </div>
    }`,
})
export class TemaPage {
  readonly store = inject(ForoStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly tema = computed(() =>
    this.store.estado().temas.find((t) => t.id === this.id && !t.oculto),
  );
  readonly comentarios = computed(() =>
    this.store
      .estado()
      .comentarios.filter((c) => c.temaId === this.id && !c.oculto),
  );
  readonly error = signal('');
  readonly edicion = signal(0);
  readonly confirmarTema = signal(false);
  readonly confirmarComentario = signal(0);
  readonly form = this.fb.nonNullable.group({
    contenido: ['', texto(2, 2000)],
  });
  comentar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    try {
      this.store.guardarComentario(
        this.id,
        this.form.getRawValue().contenido,
        this.edicion() || undefined,
      );
      this.cancelarEdicion();
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  editarComentario(id: number, contenido: string) {
    this.edicion.set(id);
    this.form.setValue({ contenido });
  }
  cancelarEdicion() {
    this.edicion.set(0);
    this.form.reset();
  }
  eliminarTema() {
    try {
      this.store.eliminarTema(this.id);
      this.router.navigateByUrl('/');
    } catch (e) {
      this.error.set((e as Error).message);
      this.confirmarTema.set(false);
    }
  }
  eliminarComentario(id: number) {
    try {
      this.store.eliminarComentario(id);
      this.confirmarComentario.set(0);
      if (this.edicion() === id) this.cancelarEdicion();
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
@Component({
  imports: [RouterLink, ReactiveFormsModule],
  template: `<a class="back-link" routerLink="/">← Volver al foro</a>
    <div class="row justify-content-center">
      <section class="col-12 col-md-10 col-lg-8">
        <div class="panel form-panel">
          <span class="eyebrow">COMPARTE LO QUE TE MUEVE</span>
          <h1>{{ id ? 'Editar conversación' : 'Una nueva conversación' }}</h1>
          <p>Una pregunta clara puede abrir muchas miradas.</p>
          @if (error()) {
            <p class="alert alert-danger" role="alert">{{ error() }}</p>
          }
          @if (disponible) {
            <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
              <label for="titulo">Título</label
              ><input
                id="titulo"
                class="form-control"
                formControlName="titulo"
                maxlength="150"
                placeholder="¿De qué te gustaría conversar?"
              />
              @if (invalido('titulo')) {
                <small class="field-error">Usa entre 5 y 150 caracteres.</small>
              }
              <label for="categoria">Categoría</label
              ><select
                id="categoria"
                class="form-select"
                formControlName="categoriaId"
              >
                <option [ngValue]="0">Selecciona una categoría</option>
                @for (c of store.estado().categorias; track c.id) {
                  <option [ngValue]="c.id">{{ c.nombre }}</option>
                }
              </select>
              @if (invalido('categoriaId')) {
                <small class="field-error">Selecciona una categoría.</small>
              }
              <label for="contenido">Tu conversación</label
              ><textarea
                id="contenido"
                rows="7"
                class="form-control"
                formControlName="contenido"
                maxlength="5000"
                placeholder="Cuéntanos un poco más…"
              ></textarea>
              @if (invalido('contenido')) {
                <small class="field-error"
                  >Usa entre 10 y 5000 caracteres.</small
                >
              }
              <div class="d-flex gap-2 mt-4">
                <button class="btn btn-dark" type="submit">
                  {{ id ? 'Guardar cambios' : 'Publicar tema' }}</button
                ><a class="btn btn-outline-secondary" routerLink="/"
                  >Cancelar</a
                >
              </div>
            </form>
          }
        </div>
      </section>
    </div>`,
})
export class TemaForm {
  readonly store = inject(ForoStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;
  readonly error = signal('');
  disponible = true;
  readonly form = this.fb.nonNullable.group({
    titulo: ['', texto(5, 150)],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    contenido: ['', texto(10, 5000)],
  });
  constructor() {
    if (this.id) {
      const t = this.store.estado().temas.find((t) => t.id === this.id);
      if (t && this.store.puedeEditar(t.autorId)) {
        this.form.patchValue(t);
      } else {
        this.disponible = false;
        this.error.set('No tienes acceso para editar este tema.');
      }
    }
  }
  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c?.invalid && c.touched;
  }
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    try {
      const v = this.form.getRawValue();
      const id = this.store.guardarTema(
        { ...v, titulo: v.titulo.trim(), contenido: v.contenido.trim() },
        this.id || undefined,
      );
      this.router.navigate(['/temas', id]);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
