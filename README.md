# Entre Líneas

Frontend del sistema de foros para la Sumativa de Semana 5 de Desarrollo Full Stack III.
Usamos Angular, formularios reactivos y Bootstrap. La información se maneja con listas en memoria,
como pide la actividad: esta versión no llama a las API de Usuarios ni Foro.

## Iniciar

En PowerShell de Visual Studio Code, desde esta carpeta:

```powershell
npm.cmd ci
npm.cmd start
```

Abrir http://localhost:4200.
`npm.cmd test -- --watch=false` ejecuta las pruebas y `npm.cmd run build` genera la aplicación.

## Cuentas de práctica

| Rol           | Correo        | Clave          |
| ------------- | ------------- | -------------- |
| Administrador | admin@foro.cl | AdminDemo2026! |
| Usuario       | ana@foro.cl   | AnaDemo2026!   |
| Usuario       | luis@foro.cl  | LuisDemo2026!  |

Son cuentas locales de demostración. No usar contraseñas reales. Los datos y cambios se reinician
al recargar la página; cerrar sesión conserva los cambios mientras la aplicación siga abierta.
La recuperación muestra un código de un solo uso en pantalla y no envía correos.
Esta autenticación simula roles para evaluar el frontend; la seguridad real del backend se prueba por separado.

## Qué podemos demostrar

- Inicio de sesión, registro, recuperación, modificación de perfil y eliminación de cuenta sin contenido asociado.
- Cinco categorías; búsqueda por título o contenido; listado y detalle de temas.
- Crear y editar temas y comentarios propios; eliminar contenido propio con confirmación.
- Administrador: retirar y restaurar temas/comentarios indicando un motivo, crear y editar categorías.
- Validaciones de campos y contraseñas: 10–64 caracteres, mayúscula, minúscula, número, símbolo y sin espacios.
- Grid Bootstrap de 12 columnas; móvil, tablet y escritorio.

## Cómo organizamos el código

`models.ts` define las entidades; `foro-store.ts` mantiene las colecciones y las reglas;
`pages` contiene componentes y plantillas de las pantallas. Aplicamos la separación modelo/vista/control
adaptada a Angular. `ForoStore` tiene una sola instancia mediante `providedIn: root` (Singleton).
Los componentes reciben las actualizaciones de su Observable `estado$`, generado con `BehaviorSubject`
y convertido a signal para la vista (Observer).


## Docker

El Dockerfile compila Angular y sirve los archivos con Nginx sin privilegios. Incluye fallback
para abrir directamente las rutas internas. Desde Semana 5, ejecutar:

```powershell
docker compose up -d --build
```

Frontend Docker: http://localhost:4300. Usuarios Docker: http://localhost:9081.
Foro Docker: http://localhost:9082. Las API requieren las wallets y archivos privados de cada proyecto.
El frontend sigue usando datos locales y funciona por separado.

AWS está desplegado en http://3.86.216.48/ y fue comprobado por HTTP el 22 de noviembre. El acceso está limitado a la IP autorizada y la dirección puede cambiar al reiniciar el laboratorio.

Repositorio: https://github.com/elwerneira/Foro-Web. El commit de esta entrega se llama `Sumativa semana 5`.

El workflow de GitHub Actions ejecuta las 13 pruebas, compila Angular, publica la imagen en ECR y despliega en la instancia de Semana 5 cuando están configurados los secretos y variables de AWS. El resultado de cada ejecución se consulta en la pestaña Actions del repositorio.

Para ejecutar solamente este frontend con Docker desde su propia carpeta:

```powershell
docker build -t foro-web .
docker run --rm -p 4300:8080 foro-web
```

Abrir http://localhost:4300. Esta alternativa no necesita las API ni Oracle, porque los datos del frontend están en memoria.

Los guiones personales de grabación se conservan fuera del repositorio. Las credenciales de AWS se configuran como secretos cifrados de Actions, nunca en los archivos fuente.
