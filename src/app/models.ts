export type Rol = 'USUARIO' | 'ADMIN';
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  clave: string;
  rol: Rol;
  bio: string;
}
export type Perfil = Omit<Usuario, 'clave'>;
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
}
export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  categoriaId: number;
  autorId: number;
  fecha: string;
  oculto: boolean;
  motivo: string;
}
export interface Comentario {
  id: number;
  temaId: number;
  autorId: number;
  contenido: string;
  fecha: string;
  oculto: boolean;
  motivo: string;
}
export interface Estado {
  usuarios: Usuario[];
  categorias: Categoria[];
  temas: Tema[];
  comentarios: Comentario[];
}
