import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoStore } from '../foro-store';
import { texto } from '../validaciones';
@Component({
  imports: [RouterLink, ReactiveFormsModule],
  template: `<a class="back-link" routerLink="/">← Volver al foro</a>
    <div class="section-top">
      <div>
        <span class="eyebrow">CUIDEMOS LA COMUNIDAD</span>
        <h1>Administración</h1>
        <p>
          Revisa las conversaciones y retira contenido que incumpla las normas.
        </p>
      </div>
      <span class="tag green">Acceso Administrador</span>
    </div>
    @if (error()) {
      <p class="alert alert-danger" role="alert">{{ error() }}</p>
    }
    @if (mensaje()) {
      <p class="alert alert-success" role="status">{{ mensaje() }}</p>
    }
    <nav class="tab-nav" aria-label="Secciones de administración">
      <button
        [class.active]="seccion() === 'temas'"
        (click)="seccion.set('temas')"
      >
        Temas</button
      ><button
        [class.active]="seccion() === 'comentarios'"
        (click)="seccion.set('comentarios')"
      >
        Comentarios</button
      ><button
        [class.active]="seccion() === 'categorias'"
        (click)="seccion.set('categorias')"
      >
        Categorías
      </button>
    </nav>
    @if (seccion() === 'categorias') {
      <div class="row g-4">
        <section class="col-12 col-lg-7">
          @for (c of store.estado().categorias; track c.id) {
            <article class="panel mb-3">
              <h3>{{ c.nombre }}</h3>
              <p>{{ c.descripcion }}</p>
              <button
                class="btn btn-outline-dark btn-sm"
                (click)="editarCategoria(c.id, c.nombre, c.descripcion)"
              >
                Editar categoría
              </button>
            </article>
          }
        </section>
        <section class="col-12 col-lg-5">
          <div class="panel">
            <h2>
              {{ categoriaId() ? 'Editar categoría' : 'Nueva categoría' }}
            </h2>
            <form
              [formGroup]="categoria"
              (ngSubmit)="guardarCategoria()"
              novalidate
            >
              <label for="cat-nombre">Nombre</label
              ><input
                id="cat-nombre"
                class="form-control"
                formControlName="nombre"
                maxlength="80"
              /><label for="cat-desc">Descripción</label
              ><textarea
                id="cat-desc"
                class="form-control"
                formControlName="descripcion"
                maxlength="300"
                rows="3"
              ></textarea>
              @if (categoria.invalid && categoria.touched) {
                <p class="field-error">
                  Nombre de 3–80 y descripción de 5–300 caracteres.
                </p>
              }
              <button class="btn btn-dark mt-3" type="submit">
                Guardar categoría
              </button>
              @if (categoriaId()) {
                <button
                  type="button"
                  class="btn btn-link"
                  (click)="categoriaId.set(0); categoria.reset()"
                >
                  Cancelar
                </button>
              }
            </form>
          </div>
        </section>
      </div>
    }
    @if (seccion() === 'temas') {
      @for (t of store.estado().temas; track t.id) {
        <article class="panel moderation-row">
          <div>
            <span [class]="t.oculto ? 'tag pink' : 'tag green'">{{
              t.oculto ? 'Retirado' : 'Visible'
            }}</span>
            <h3>{{ t.titulo }}</h3>
            <p>
              {{ store.autor(t.autorId) }} ·
              {{ store.categoria(t.categoriaId)?.nombre }}
            </p>
            @if (t.oculto) {
              <p class="moderation-reason">Motivo: {{ t.motivo }}</p>
            } @else {
              <a [routerLink]="['/temas', t.id]">Ver tema →</a>
            }
          </div>
          <button
            class="btn btn-outline-dark btn-sm"
            (click)="preparar('tema', t.id, t.oculto)"
          >
            {{ t.oculto ? 'Restaurar' : 'Retirar tema' }}
          </button>
        </article>
      }
    }
    @if (seccion() === 'comentarios') {
      @for (c of store.estado().comentarios; track c.id) {
        <article class="panel moderation-row">
          <div>
            <span [class]="c.oculto ? 'tag pink' : 'tag green'">{{
              c.oculto ? 'Retirado' : 'Visible'
            }}</span>
            <p class="body-text">{{ c.contenido }}</p>
            <small>{{ store.autor(c.autorId) }}</small>
            @if (c.oculto) {
              <p class="moderation-reason">Motivo: {{ c.motivo }}</p>
            }
          </div>
          <button
            class="btn btn-outline-dark btn-sm"
            (click)="preparar('comentario', c.id, c.oculto)"
          >
            {{ c.oculto ? 'Restaurar' : 'Retirar comentario' }}
          </button>
        </article>
      } @empty {
        <div class="panel empty">No hay comentarios para revisar.</div>
      }
    }
    <dialog
      #moderacionDialog
      class="moderation-dialog"
      aria-labelledby="mod-titulo"
      (cancel)="objetivo.set(null)"
    >
      @if (objetivo(); as obj) {
        <div class="panel">
          <h2 id="mod-titulo">Retirar {{ obj.tipo }}</h2>
          <p>
            El contenido dejará de mostrarse en el foro, pero podrás
            restaurarlo.
          </p>
          <form [formGroup]="moderacion" (ngSubmit)="moderar()" novalidate>
            <label for="motivo">Motivo de moderación</label
            ><textarea
              id="motivo"
              class="form-control"
              formControlName="motivo"
              rows="3"
              maxlength="300"
            ></textarea>
            @if (moderacion.invalid && moderacion.touched) {
              <p class="field-error">Indica un motivo de 5 a 300 caracteres.</p>
            }
            <button class="btn btn-danger mt-3 me-2" type="submit">
              Confirmar retiro</button
            ><button
              class="btn btn-outline-secondary mt-3"
              type="button"
              (click)="cancelar()"
            >
              Cancelar
            </button>
          </form>
        </div>
      }
    </dialog>`,
})
export class Administracion {
  private readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('moderacionDialog');
  cancelar() {
    this.dialog().nativeElement.close();
    this.objetivo.set(null);
  }
  readonly store = inject(ForoStore);
  private fb = inject(FormBuilder);
  readonly seccion = signal('temas');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly categoriaId = signal(0);
  readonly objetivo = signal<{
    tipo: 'tema' | 'comentario';
    id: number;
  } | null>(null);
  readonly categoria = this.fb.nonNullable.group({
    nombre: ['', texto(3, 80)],
    descripcion: ['', texto(5, 300)],
  });
  readonly moderacion = this.fb.nonNullable.group({
    motivo: ['', texto(5, 300)],
  });
  preparar(tipo: 'tema' | 'comentario', id: number, oculto: boolean) {
    this.error.set('');
    if (oculto) {
      try {
        this.store.moderar(tipo, id, false, '');
        this.mensaje.set('Contenido restaurado.');
      } catch (e) {
        this.error.set((e as Error).message);
      }
    } else {
      this.objetivo.set({ tipo, id });
      this.moderacion.reset();
      this.dialog().nativeElement.showModal();
    }
  }
  moderar() {
    this.moderacion.markAllAsTouched();
    if (this.moderacion.invalid) return;
    const obj = this.objetivo()!;
    try {
      this.store.moderar(
        obj.tipo,
        obj.id,
        true,
        this.moderacion.getRawValue().motivo,
      );
      this.cancelar();
      this.mensaje.set('Contenido retirado del foro.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  editarCategoria(id: number, nombre: string, descripcion: string) {
    this.categoriaId.set(id);
    this.categoria.setValue({ nombre, descripcion });
  }
  guardarCategoria() {
    this.categoria.markAllAsTouched();
    if (this.categoria.invalid) return;
    try {
      const v = this.categoria.getRawValue();
      this.store.guardarCategoria(
        v.nombre,
        v.descripcion,
        this.categoriaId() || undefined,
      );
      this.categoria.reset();
      this.categoriaId.set(0);
      this.error.set('');
      this.mensaje.set('Categoría guardada.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
