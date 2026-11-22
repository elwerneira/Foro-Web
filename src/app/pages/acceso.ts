import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForoStore } from '../foro-store';
import { claveSegura, coinciden, correo, texto } from '../validaciones';
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: ` <div class="row justify-content-center g-4 auth-layout">
    <div class="col-12 col-md-5 auth-story">
      <span class="eyebrow">ENTRE LÍNEAS</span>
      <h1>Tu próxima buena<br />conversación<br />empieza aquí.</h1>
      <p>Un espacio para aprender, descubrir y compartir con otras personas.</p>
      <img
        src="/lecturas.svg"
        alt="Libros y una planta"
        width="250"
        height="173"
      />
    </div>
    <section class="col-12 col-md-7 col-lg-6">
      <div class="panel form-panel">
        <span class="eyebrow">{{
          modo === 'login'
            ? 'QUÉ BUENO VERTE'
            : modo === 'registro'
              ? 'SUMA TU VOZ'
              : 'RECUPERA TU ACCESO'
        }}</span>
        <h2>
          {{
            modo === 'login'
              ? 'Iniciar sesión'
              : modo === 'registro'
                ? 'Crea tu cuenta'
                : 'Recuperar contraseña'
          }}
        </h2>
        @if (error()) {
          <p class="alert alert-danger" role="alert">{{ error() }}</p>
        }
        @if (mensaje()) {
          <p class="alert alert-success" role="status">{{ mensaje() }}</p>
        }
        @if (modo === 'recuperar') {
          <p>
            Indica el correo de tu cuenta. En esta demo el código se muestra
            aquí; no se envían correos.
          </p>
          <form [formGroup]="recuperacion" (ngSubmit)="solicitar()" novalidate>
            <label for="rec-correo">Correo electrónico</label
            ><input
              id="rec-correo"
              type="email"
              class="form-control"
              formControlName="correo"
              autocomplete="email"
              maxlength="150"
            />
            @if (recuperacion.invalid && recuperacion.touched) {
              <small class="field-error">Ingresa un correo válido.</small>
            }
            <button class="btn btn-dark mt-3" type="submit">
              Solicitar código
            </button>
          </form>
          @if (codigo()) {
            <div class="demo-code">
              Código de demostración: <strong>{{ codigo() }}</strong>
            </div>
            <form [formGroup]="reset" (ngSubmit)="recuperar()" novalidate>
              <label for="codigo">Código de recuperación</label
              ><input
                id="codigo"
                class="form-control"
                formControlName="codigo"
                inputmode="numeric"
                maxlength="6"
              /><label for="nueva-clave">Nueva contraseña</label
              ><input
                id="nueva-clave"
                type="password"
                class="form-control"
                formControlName="clave"
                autocomplete="new-password"
                maxlength="64"
              />
              <p class="form-hint">
                10 a 64 caracteres; mayúscula, minúscula, número y símbolo. Sin
                espacios.
              </p>
              <label for="confirmar-clave">Repetir contraseña</label
              ><input
                id="confirmar-clave"
                class="form-control"
                type="password"
                formControlName="confirmacion"
                autocomplete="new-password"
                maxlength="64"
              />
              @if (reset.invalid && reset.touched) {
                <small class="field-error"
                  >Revisa el código, la seguridad de la contraseña y que ambas
                  coincidan.</small
                >
              }
              <button class="btn btn-dark mt-3" type="submit">
                Cambiar contraseña
              </button>
            </form>
          }
          <a class="form-link" routerLink="/ingresar"
            >Volver a iniciar sesión</a
          >
        } @else {
          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
            @if (modo === 'registro') {
              <label for="nombre">Nombre</label
              ><input
                id="nombre"
                class="form-control"
                formControlName="nombre"
                autocomplete="name"
                maxlength="80"
              />
              @if (invalido('nombre')) {
                <small class="field-error"
                  >Usa entre 2 y 80 caracteres, no solo espacios.</small
                >
              }
            }
            <label for="correo">Correo electrónico</label
            ><input
              id="correo"
              class="form-control"
              type="email"
              formControlName="correo"
              autocomplete="email"
              maxlength="150"
            />
            @if (invalido('correo')) {
              <small class="field-error"
                >Ingresa un correo válido, de hasta 150 caracteres.</small
              >
            }
            <label for="clave">Contraseña</label
            ><input
              id="clave"
              type="password"
              class="form-control"
              formControlName="clave"
              [attr.autocomplete]="
                modo === 'registro' ? 'new-password' : 'current-password'
              "
              maxlength="64"
            />
            @if (modo === 'registro') {
              <p class="form-hint">
                10 a 64 caracteres; mayúscula, minúscula, número y símbolo. Sin
                espacios.
              </p>
              <label for="confirmacion">Repetir contraseña</label
              ><input
                id="confirmacion"
                class="form-control"
                type="password"
                formControlName="confirmacion"
                autocomplete="new-password"
                maxlength="64"
              />
            }
            @if (
              invalido('clave') || (form.hasError('coinciden') && form.touched)
            ) {
              <small class="field-error">{{
                modo === 'registro'
                  ? 'La contraseña debe cumplir las reglas y coincidir en ambos campos.'
                  : 'Ingresa tu contraseña.'
              }}</small>
            }
            <button class="btn btn-dark w-100 mt-4" type="submit">
              {{ modo === 'login' ? 'Ingresar' : 'Crear cuenta' }}
            </button>
          </form>
          @if (modo === 'login') {
            <a class="form-link" routerLink="/recuperar"
              >¿Olvidaste tu contraseña?</a
            >
            <p class="mt-3">
              ¿Primera vez aquí? <a routerLink="/registro">Crea tu cuenta</a>
            </p>
            <details class="demo-accounts">
              <summary>Cuentas de demostración</summary>
              <p>
                Administrador: <code>admin&#64;foro.cl</code><br /><code
                  >AdminDemo2026!</code
                >
              </p>
              <p>
                Usuario: <code>ana&#64;foro.cl</code><br /><code
                  >AnaDemo2026!</code
                >
              </p>
            </details>
          } @else {
            <p class="mt-3">
              ¿Ya tienes una cuenta? <a routerLink="/ingresar">Inicia sesión</a>
            </p>
          }
        }
      </div>
    </section>
  </div>`,
})
export class Acceso {
  private fb = inject(FormBuilder);
  private store = inject(ForoStore);
  private router = inject(Router);
  readonly modo = inject(ActivatedRoute).snapshot.data['modo'] as string;
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly codigo = signal('');
  readonly form = this.fb.nonNullable.group({
    nombre: [''],
    correo: ['', correo],
    clave: ['', Validators.required],
    confirmacion: [''],
  });
  readonly recuperacion = this.fb.nonNullable.group({ correo: ['', correo] });
  readonly reset = this.fb.nonNullable.group(
    {
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      clave: ['', [Validators.required, claveSegura]],
      confirmacion: ['', Validators.required],
    },
    { validators: coinciden },
  );
  constructor() {
    if (this.modo === 'registro') {
      this.form.controls.nombre.setValidators(texto(2, 80));
      this.form.controls.clave.addValidators(claveSegura);
      this.form.controls.confirmacion.setValidators(Validators.required);
      this.form.setValidators(coinciden);
    }
  }
  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c?.invalid && c.touched;
  }
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.error.set('');
    try {
      const v = this.form.getRawValue();
      if (this.modo === 'login') this.store.login(v.correo, v.clave);
      else this.store.registrar(v.nombre, v.correo, v.clave);
      this.router.navigateByUrl('/');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  solicitar() {
    this.recuperacion.markAllAsTouched();
    if (this.recuperacion.invalid) return;
    this.error.set('');
    this.mensaje.set('');
    try {
      this.codigo.set(
        this.store.solicitarRecuperacion(
          this.recuperacion.getRawValue().correo,
        ),
      );
      this.reset.reset();
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  recuperar() {
    this.reset.markAllAsTouched();
    if (this.reset.invalid) return;
    try {
      const v = this.reset.getRawValue();
      this.store.recuperar(
        this.recuperacion.getRawValue().correo,
        v.codigo,
        v.clave,
      );
      this.codigo.set('');
      this.mensaje.set('Contraseña actualizada. Ya puedes iniciar sesión.');
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
