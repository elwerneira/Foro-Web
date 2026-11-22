import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoStore } from '../foro-store';
import { claveSegura, correo, texto } from '../validaciones';
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: `<a class="back-link" routerLink="/">← Volver al foro</a>
    <div class="row g-4">
      <aside class="col-12 col-md-4">
        <div class="panel profile-summary">
          <span class="avatar large">{{
            store.actual()?.nombre?.charAt(0)
          }}</span>
          <h1>{{ store.actual()?.nombre }}</h1>
          <span class="tag green">{{
            store.actual()?.rol === 'ADMIN'
              ? 'Administrador'
              : 'Miembro de la comunidad'
          }}</span>
          <p class="mt-3">
            {{ store.actual()?.bio || 'Cuéntanos algo sobre ti.' }}
          </p>
        </div>
      </aside>
      <section class="col-12 col-md-8">
        <div class="panel form-panel">
          <span class="eyebrow">TU ESPACIO</span>
          <h2>Editar mi perfil</h2>
          @if (error()) {
            <p role="alert" class="alert alert-danger">{{ error() }}</p>
          }
          @if (mensaje()) {
            <p role="status" class="alert alert-success">{{ mensaje() }}</p>
          }
          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
            <label for="nombre">Nombre</label
            ><input
              id="nombre"
              class="form-control"
              formControlName="nombre"
              maxlength="80"
              autocomplete="name"
            /><label for="correo">Correo electrónico</label
            ><input
              id="correo"
              class="form-control"
              type="email"
              formControlName="correo"
              maxlength="150"
              autocomplete="email"
            /><label for="bio">Acerca de mí</label
            ><textarea
              id="bio"
              class="form-control"
              formControlName="bio"
              rows="3"
              maxlength="300"
            ></textarea
            ><label for="clave">Nueva contraseña (opcional)</label
            ><input
              id="clave"
              class="form-control"
              type="password"
              formControlName="clave"
              maxlength="64"
              autocomplete="new-password"
            />
            <p class="form-hint">
              Déjala vacía para conservarla. Si la cambias: 10 a 64 caracteres,
              mayúscula, minúscula, número y símbolo, sin espacios.
            </p>
            @if (form.invalid && form.touched) {
              <p class="field-error">
                Revisa el nombre (2–80), el correo, la biografía (máximo 300) y
                la contraseña.
              </p>
            }
            <button class="btn btn-dark" type="submit">Guardar cambios</button>
          </form>
        </div>
        @if (store.actual()?.rol !== 'ADMIN') {
          <div class="panel mt-4">
            <h3>Eliminar mi cuenta</h3>
            <p>
              Solo puedes eliminarla si no tiene temas ni comentarios asociados.
            </p>
            @if (confirmar()) {
              <p>¿Confirmas la eliminación de tu cuenta?</p>
              <button class="btn btn-danger me-2" (click)="eliminar()">
                Sí, eliminar cuenta</button
              ><button
                class="btn btn-outline-secondary"
                (click)="confirmar.set(false)"
              >
                Cancelar
              </button>
            } @else {
              <button
                class="btn btn-outline-danger"
                (click)="confirmar.set(true)"
              >
                Eliminar cuenta
              </button>
            }
          </div>
        }
      </section>
    </div>`,
})
export class PerfilPage {
  readonly store = inject(ForoStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly confirmar = signal(false);
  readonly form = this.fb.nonNullable.group({
    nombre: [this.store.actual()!.nombre, texto(2, 80)],
    correo: [this.store.actual()!.correo, correo],
    bio: [
      this.store.actual()!.bio,
      (c: AbstractControl) =>
        String(c.value).length > 300 ? { max: true } : null,
    ],
    clave: ['', (c: AbstractControl) => (c.value ? claveSegura(c) : null)],
  });
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    try {
      const v = this.form.getRawValue();
      this.store.guardarPerfil(v.nombre, v.correo, v.bio, v.clave);
      this.form.controls.clave.reset();
      this.error.set('');
      this.mensaje.set('Tu perfil se actualizó.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  eliminar() {
    try {
      this.store.eliminarCuenta();
      this.router.navigateByUrl('/');
    } catch (e) {
      this.error.set((e as Error).message);
      this.confirmar.set(false);
    }
  }
}
