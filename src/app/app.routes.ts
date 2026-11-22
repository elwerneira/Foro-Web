import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { ForoStore } from './foro-store';
const autenticado: CanActivateFn = () =>
  inject(ForoStore).actual()
    ? true
    : inject(Router).createUrlTree(['/ingresar']);
const administrador: CanActivateFn = () =>
  inject(ForoStore).actual()?.rol === 'ADMIN'
    ? true
    : inject(Router).createUrlTree(['/']);
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio').then((m) => m.Inicio),
    title: 'Entre Líneas · Conversaciones que conectan',
  },
  {
    path: 'ingresar',
    loadComponent: () => import('./pages/acceso').then((m) => m.Acceso),
    data: { modo: 'login' },
    title: 'Ingresar · Entre Líneas',
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/acceso').then((m) => m.Acceso),
    data: { modo: 'registro' },
    title: 'Crear cuenta · Entre Líneas',
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/acceso').then((m) => m.Acceso),
    data: { modo: 'recuperar' },
    title: 'Recuperar acceso · Entre Líneas',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil').then((m) => m.PerfilPage),
    canActivate: [autenticado],
    title: 'Mi perfil · Entre Líneas',
  },
  {
    path: 'temas/nuevo',
    loadComponent: () => import('./pages/tema').then((m) => m.TemaForm),
    canActivate: [autenticado],
    title: 'Nueva conversación · Entre Líneas',
  },
  {
    path: 'temas/:id/editar',
    loadComponent: () => import('./pages/tema').then((m) => m.TemaForm),
    canActivate: [autenticado],
    title: 'Editar conversación · Entre Líneas',
  },
  {
    path: 'temas/:id',
    loadComponent: () => import('./pages/tema').then((m) => m.TemaPage),
    title: 'Conversación · Entre Líneas',
  },
  {
    path: 'administracion',
    loadComponent: () =>
      import('./pages/administracion').then((m) => m.Administracion),
    canActivate: [administrador],
    title: 'Administración · Entre Líneas',
  },
  { path: '**', redirectTo: '' },
];
