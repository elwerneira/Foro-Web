import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { Categoria, Comentario, Estado, Perfil, Tema, Usuario } from './models';

function inicial(): Estado {
  return {
    usuarios: [
      {
        id: 1,
        nombre: 'Elena Admin',
        correo: 'admin@foro.cl',
        clave: 'AdminDemo2026!',
        rol: 'ADMIN',
        bio: 'Cuidando este espacio de conversación.',
      },
      {
        id: 2,
        nombre: 'Ana Torres',
        correo: 'ana@foro.cl',
        clave: 'AnaDemo2026!',
        rol: 'USUARIO',
        bio: 'Me gustan los libros y aprender cosas nuevas.',
      },
      {
        id: 3,
        nombre: 'Luis Rojas',
        correo: 'luis@foro.cl',
        clave: 'LuisDemo2026!',
        rol: 'USUARIO',
        bio: 'Tecnología, cine y buenas conversaciones.',
      },
    ],
    categorias: [
      {
        id: 1,
        nombre: 'Libros y lecturas',
        descripcion: 'Historias que vale la pena compartir.',
        color: 'green',
      },
      {
        id: 2,
        nombre: 'Tecnología',
        descripcion: 'Ideas, herramientas y aprendizaje.',
        color: 'blue',
      },
      {
        id: 3,
        nombre: 'Cine y series',
        descripcion: 'Una buena historia también se ve.',
        color: 'purple',
      },
      {
        id: 4,
        nombre: 'Vida universitaria',
        descripcion: 'Nos acompañamos en el camino.',
        color: 'orange',
      },
      {
        id: 5,
        nombre: 'Tiempo libre',
        descripcion: 'Hobbies y pequeños descubrimientos.',
        color: 'pink',
      },
    ],
    temas: [
      {
        id: 1,
        titulo: '¿Qué libro les devolvió las ganas de leer?',
        contenido:
          'Estoy buscando una lectura para desconectarme después de clases. Me gustan las historias cortas con personajes que se quedan contigo. ¿Qué libro recomendarían y por qué?',
        categoriaId: 1,
        autorId: 2,
        fecha: '2026-11-20T18:30:00',
        oculto: false,
        motivo: '',
      },
      {
        id: 2,
        titulo: 'Aprender Angular: un paso a la vez',
        contenido:
          'Esta semana estamos creando nuestros primeros componentes. Mi consejo es separar la vista de los datos y probar una funcionalidad a la vez. ¿Qué les ha resultado más útil?',
        categoriaId: 2,
        autorId: 3,
        fecha: '2026-11-21T10:00:00',
        oculto: false,
        motivo: '',
      },
      {
        id: 3,
        titulo: '¿Cómo organizan una semana con varias entregas?',
        contenido:
          'Estoy probando una lista corta de pendientes diarios. ¿Tienen alguna estrategia para estudiar y también descansar?',
        categoriaId: 4,
        autorId: 2,
        fecha: '2026-11-21T15:00:00',
        oculto: false,
        motivo: '',
      },
    ],
    comentarios: [
      {
        id: 1,
        temaId: 1,
        autorId: 3,
        contenido:
          'Papelucho siempre es una buena compañía. Es cercano y se lee rápido.',
        fecha: '2026-11-21T12:00:00',
        oculto: false,
        motivo: '',
      },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class ForoStore {
  // Singleton por la inyección raíz; los componentes observan los cambios del servicio.
  private readonly cambios = new BehaviorSubject<Estado>(inicial());
  readonly estado$ = this.cambios.asObservable();
  readonly estado = toSignal(this.estado$, {
    initialValue: this.cambios.value,
  });
  private readonly sesion = new BehaviorSubject<number | null>(null);
  private readonly sesionId = toSignal(this.sesion, { initialValue: null });
  readonly actual = computed<Perfil | null>(() => {
    const user = this.estado().usuarios.find((u) => u.id === this.sesionId());
    if (!user) return null;
    const { clave, ...perfil } = user;
    return perfil;
  });
  private recuperacion: { correo: string; codigo: string } | null = null;
  private cambiar(parte: Partial<Estado>) {
    this.cambios.next({ ...this.estado(), ...parte });
  }
  private siguiente(items: { id: number }[]) {
    return Math.max(0, ...items.map((i) => i.id)) + 1;
  }
  private exigir() {
    const u = this.actual();
    if (!u) throw new Error('Inicia sesión para continuar.');
    return u;
  }
  private admin() {
    const u = this.exigir();
    if (u.rol !== 'ADMIN')
      throw new Error('Esta acción requiere el rol Administrador.');
    return u;
  }
  puedeEditar(autorId: number) {
    return (
      !!this.actual() &&
      (this.actual()!.id === autorId || this.actual()!.rol === 'ADMIN')
    );
  }
  autor(id: number) {
    return (
      this.estado().usuarios.find((u) => u.id === id)?.nombre ??
      'Cuenta eliminada'
    );
  }
  categoria(id: number) {
    return this.estado().categorias.find((c) => c.id === id);
  }
  login(correo: string, clave: string) {
    const u = this.estado().usuarios.find(
      (u) => u.correo === correo.trim().toLowerCase() && u.clave === clave,
    );
    if (!u) throw new Error('Correo o contraseña incorrectos.');
    this.sesion.next(u.id);
  }
  salir() {
    this.sesion.next(null);
  }
  registrar(nombre: string, correo: string, clave: string) {
    correo = correo.trim().toLowerCase();
    if (this.estado().usuarios.some((u) => u.correo === correo))
      throw new Error('Este correo ya está registrado.');
    const u: Usuario = {
      id: this.siguiente(this.estado().usuarios),
      nombre: nombre.trim(),
      correo,
      clave,
      rol: 'USUARIO',
      bio: '',
    };
    this.cambiar({ usuarios: [...this.estado().usuarios, u] });
    this.sesion.next(u.id);
  }
  guardarPerfil(nombre: string, correo: string, bio: string, clave: string) {
    const u = this.exigir();
    correo = correo.trim().toLowerCase();
    if (
      this.estado().usuarios.some((x) => x.id !== u.id && x.correo === correo)
    )
      throw new Error('Este correo ya está registrado.');
    this.cambiar({
      usuarios: this.estado().usuarios.map((x) =>
        x.id === u.id
          ? {
              ...x,
              nombre: nombre.trim(),
              correo,
              bio: bio.trim(),
              ...(clave ? { clave } : {}),
            }
          : x,
      ),
    });
  }
  eliminarCuenta() {
    const u = this.exigir();
    if (u.rol === 'ADMIN')
      throw new Error(
        'La cuenta administradora se conserva para gestionar la demostración.',
      );
    if (
      this.estado().temas.some((t) => t.autorId === u.id) ||
      this.estado().comentarios.some((c) => c.autorId === u.id)
    )
      throw new Error(
        'Primero elimina tus temas y comentarios para conservar la integridad del foro.',
      );
    this.cambiar({
      usuarios: this.estado().usuarios.filter((x) => x.id !== u.id),
    });
    this.salir();
  }
  solicitarRecuperacion(correo: string) {
    correo = correo.trim().toLowerCase();
    if (!this.estado().usuarios.some((u) => u.correo === correo))
      throw new Error('No encontramos una cuenta con ese correo.');
    // shortcut: recuperación local académica; al integrar la API usar envío y validación en servidor.
    const codigo = String(
      (crypto.getRandomValues(new Uint32Array(1))[0] % 900000) + 100000,
    );
    this.recuperacion = { correo, codigo };
    return codigo;
  }
  recuperar(correo: string, codigo: string, clave: string) {
    if (
      !this.recuperacion ||
      this.recuperacion.correo !== correo.trim().toLowerCase() ||
      this.recuperacion.codigo !== codigo.trim()
    )
      throw new Error(
        'El código no es válido. Solicita uno nuevo o revisa el ingresado.',
      );
    this.cambiar({
      usuarios: this.estado().usuarios.map((u) =>
        u.correo === this.recuperacion!.correo ? { ...u, clave } : u,
      ),
    });
    this.recuperacion = null;
    this.salir();
  }
  guardarTema(
    datos: Pick<Tema, 'titulo' | 'contenido' | 'categoriaId'>,
    id?: number,
  ) {
    const u = this.exigir();
    if (!this.categoria(datos.categoriaId))
      throw new Error('Selecciona una categoría existente.');
    if (id) {
      const t = this.estado().temas.find((t) => t.id === id);
      if (!t || !this.puedeEditar(t.autorId))
        throw new Error('No tienes permiso para modificar este tema.');
      this.cambiar({
        temas: this.estado().temas.map((t) =>
          t.id === id ? { ...t, ...datos } : t,
        ),
      });
      return id;
    }
    const nuevo: Tema = {
      ...datos,
      id: this.siguiente(this.estado().temas),
      autorId: u.id,
      fecha: new Date().toISOString(),
      oculto: false,
      motivo: '',
    };
    this.cambiar({ temas: [nuevo, ...this.estado().temas] });
    return nuevo.id;
  }
  eliminarTema(id: number) {
    const t = this.estado().temas.find((t) => t.id === id);
    if (!t || !this.puedeEditar(t.autorId))
      throw new Error('No tienes permiso para eliminar este tema.');
    if (this.estado().comentarios.some((c) => c.temaId === id))
      throw new Error('El tema tiene comentarios. Deben retirarse primero.');
    this.cambiar({ temas: this.estado().temas.filter((t) => t.id !== id) });
  }
  guardarComentario(temaId: number, contenido: string, id?: number) {
    const u = this.exigir();
    const tema = this.estado().temas.find((t) => t.id === temaId && !t.oculto);
    if (!tema) throw new Error('Este tema no está disponible para comentar.');
    if (id) {
      const c = this.estado().comentarios.find(
        (c) => c.id === id && c.temaId === temaId,
      );
      if (!c || !this.puedeEditar(c.autorId))
        throw new Error('No tienes permiso para modificar este comentario.');
      this.cambiar({
        comentarios: this.estado().comentarios.map((c) =>
          c.id === id ? { ...c, contenido: contenido.trim() } : c,
        ),
      });
      return;
    }
    const nuevo: Comentario = {
      id: this.siguiente(this.estado().comentarios),
      temaId,
      contenido: contenido.trim(),
      autorId: u.id,
      fecha: new Date().toISOString(),
      oculto: false,
      motivo: '',
    };
    this.cambiar({ comentarios: [...this.estado().comentarios, nuevo] });
  }
  eliminarComentario(id: number) {
    const c = this.estado().comentarios.find((c) => c.id === id);
    if (!c || !this.puedeEditar(c.autorId))
      throw new Error('No tienes permiso para eliminar este comentario.');
    this.cambiar({
      comentarios: this.estado().comentarios.filter((c) => c.id !== id),
    });
  }
  moderar(
    tipo: 'tema' | 'comentario',
    id: number,
    oculto: boolean,
    motivo: string,
  ) {
    this.admin();
    if (oculto && motivo.trim().length < 5)
      throw new Error('Indica un motivo de al menos 5 caracteres.');
    const datos =
      tipo === 'tema' ? this.estado().temas : this.estado().comentarios;
    if (!datos.some((x) => x.id === id))
      throw new Error('El contenido ya no existe.');
    if (tipo === 'tema')
      this.cambiar({
        temas: this.estado().temas.map((t) =>
          t.id === id
            ? { ...t, oculto, motivo: oculto ? motivo.trim() : '' }
            : t,
        ),
      });
    else
      this.cambiar({
        comentarios: this.estado().comentarios.map((c) =>
          c.id === id
            ? { ...c, oculto, motivo: oculto ? motivo.trim() : '' }
            : c,
        ),
      });
  }
  guardarCategoria(nombre: string, descripcion: string, id?: number) {
    this.admin();
    if (
      this.estado().categorias.some(
        (c) =>
          c.id !== id && c.nombre.toLowerCase() === nombre.trim().toLowerCase(),
      )
    )
      throw new Error('Ya existe una categoría con este nombre.');
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() };
    this.cambiar({
      categorias: id
        ? this.estado().categorias.map((c) =>
            c.id === id ? { ...c, ...datos } : c,
          )
        : [
            ...this.estado().categorias,
            {
              ...datos,
              id: this.siguiente(this.estado().categorias),
              color: 'green',
            },
          ],
    });
  }
}
