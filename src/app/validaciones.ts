import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
export const texto = (min: number, max: number): ValidatorFn[] => [
  Validators.required,
  (c) => {
    const value = String(c.value ?? '').trim();
    return value.length < min || value.length > max ? { texto: true } : null;
  },
];
export const claveSegura: ValidatorFn = (
  c: AbstractControl,
): ValidationErrors | null =>
  /^(?=.{10,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/.test(
    c.value ?? '',
  )
    ? null
    : { claveSegura: true };
export const correo = [
  Validators.required,
  Validators.email,
  Validators.maxLength(150),
  Validators.pattern(/^\S+@\S+\.\S+$/),
];
export const coinciden: ValidatorFn = (c) =>
  c.get('clave')?.value === c.get('confirmacion')?.value
    ? null
    : { coinciden: true };
