import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { ForoStore } from './foro-store';
import { claveSegura, texto } from './validaciones';
describe('Foro local', () => {
  let store: ForoStore;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ForoStore);
  });
  it('comparte una instancia y entrega cinco categorías sin iniciar sesión', () => {
    expect(TestBed.inject(ForoStore)).toBe(store);
    expect(store.estado().categorias.length).toBe(5);
    expect(store.actual()).toBeNull();
  });
  it('rechaza credenciales incorrectas y no expone la clave en el perfil', () => {
    expect(() => store.login('ana@foro.cl', 'incorrecta')).toThrow();
    store.login('ana@foro.cl', 'AnaDemo2026!');
    expect(store.actual()?.rol).toBe('USUARIO');
    expect(store.actual()).not.toHaveProperty('clave');
  });
  it('registra como usuario y rechaza correos duplicados sin distinguir mayúsculas', () => {
    store.registrar('Marcos', 'marcos@foro.cl', 'MarcosDemo2026!');
    expect(store.actual()?.rol).toBe('USUARIO');
    expect(() =>
      store.registrar('Otra cuenta', ' MARCOS@FORO.CL ', 'MarcosDemo2026!'),
    ).toThrow(/registrado/);
  });
  it('bloquea moderación y cambios sobre contenido ajeno para usuario', () => {
    store.login('ana@foro.cl', 'AnaDemo2026!');
    expect(() => store.moderar('tema', 2, true, 'Incumple normas')).toThrow(
      /Administrador/,
    );
    expect(() =>
      store.guardarTema(
        {
          titulo: 'Otro título',
          contenido: 'Contenido de otra persona',
          categoriaId: 1,
        },
        2,
      ),
    ).toThrow(/permiso/);
    expect(() => store.eliminarComentario(1)).toThrow(/permiso/);
  });
  it('permite publicar, editar y eliminar contenido propio respetando relaciones', () => {
    store.login('ana@foro.cl', 'AnaDemo2026!');
    const id = store.guardarTema({
      titulo: 'Una pregunta',
      contenido: 'Contenido de prueba',
      categoriaId: 1,
    });
    store.guardarComentario(id, 'Respuesta de prueba');
    const cid = store.estado().comentarios.at(-1)!.id;
    expect(() => store.eliminarTema(id)).toThrow(/comentarios/);
    store.guardarComentario(id, 'Respuesta actualizada', cid);
    expect(
      store.estado().comentarios.find((c) => c.id === cid)?.contenido,
    ).toBe('Respuesta actualizada');
    store.eliminarComentario(cid);
    store.eliminarTema(id);
    expect(store.estado().temas.some((t) => t.id === id)).toBe(false);
  });
  it('exige motivo para moderar y permite restaurar sin eliminar contenido', () => {
    store.login('admin@foro.cl', 'AdminDemo2026!');
    expect(() => store.moderar('tema', 1, true, '')).toThrow(/motivo/);
    store.moderar('tema', 1, true, 'Contenido fuera de tema');
    expect(store.estado().temas.find((t) => t.id === 1)?.oculto).toBe(true);
    store.moderar('tema', 1, false, '');
    expect(store.estado().temas.find((t) => t.id === 1)?.oculto).toBe(false);
    expect(store.estado().temas.length).toBe(3);
  });
  it('recupera con código de un solo uso y deja inválida la contraseña anterior', () => {
    const codigo = store.solicitarRecuperacion('ana@foro.cl');
    expect(() =>
      store.recuperar('luis@foro.cl', codigo, 'NuevaClave2026!'),
    ).toThrow(/código/);
    store.recuperar('ana@foro.cl', codigo, 'NuevaClave2026!');
    expect(() =>
      store.recuperar('ana@foro.cl', codigo, 'OtraClave2026!'),
    ).toThrow(/código/);
    expect(() => store.login('ana@foro.cl', 'AnaDemo2026!')).toThrow();
    store.login('ana@foro.cl', 'NuevaClave2026!');
    expect(store.actual()?.correo).toBe('ana@foro.cl');
  });
  it('valida las reglas de contraseña y rechaza espacios vacíos', () => {
    for (const valor of [
      'Corta1!',
      'sinmayuscula1!',
      'SINMINUSCULA1!',
      'SinNumero!',
      'SinSimbolo123',
      'Con espacios1!',
      'A'.repeat(65),
    ])
      expect(claveSegura(new FormControl(valor))).not.toBeNull();
    expect(claveSegura(new FormControl('ValidaDemo2026!'))).toBeNull();
    expect(new FormControl('   ', texto(2, 80)).invalid).toBe(true);
  });
  it('conserva el rol al modificar perfil y permite eliminar una cuenta nueva sin publicaciones', () => {
    store.registrar('Cuenta nueva', 'nueva@foro.cl', 'NuevaDemo2026!');
    store.guardarPerfil('Nuevo nombre', 'nuevo@foro.cl', 'Mi biografía', '');
    expect(store.actual()?.rol).toBe('USUARIO');
    store.eliminarCuenta();
    expect(store.actual()).toBeNull();
    expect(store.estado().usuarios.length).toBe(3);
  });
});
