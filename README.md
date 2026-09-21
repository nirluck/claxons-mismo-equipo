# Mismo Equipo · Los Claxons × Viva

Landing de la dinámica “Mismo Equipo”. Se publica en la raíz de
**https://www.losclaxons.com/**.

Es un sitio 100 % estático: HTML, CSS, JavaScript e imágenes. No tiene build,
dependencias ni código de servidor. Lo que está en este repositorio es
exactamente lo que se sirve.

## Publicar

El contenido de este repositorio es la raíz del sitio: `index.html` tiene que
quedar directamente en el `DocumentRoot` de www.losclaxons.com.

**Opción A, recomendada.** Clonar en una carpeta nueva y apuntar el
`DocumentRoot` del virtual host a ella:

```bash
git clone https://github.com/nirluck/claxons-mismo-equipo.git /var/www/losclaxons.com
```

```apache
DocumentRoot /var/www/losclaxons.com
```

**Opción B.** Usar el `DocumentRoot` actual. Primero hay que retirar la página
genérica, porque `git clone` solo escribe en una carpeta vacía:

```bash
cd /ruta/al/DocumentRoot
git clone https://github.com/nirluck/claxons-mismo-equipo.git .
```

Para cada actualización, en esa misma carpeta:

```bash
git pull
```

## Requisitos de Apache

- **`AllowOverride FileInfo`** en la carpeta, para que Apache lea los dos
  `.htaccess`: el de la raíz y el de `assets/`. Sin ese permiso Apache
  responde 500.
- **`mod_headers`** activo, para las cabeceras de seguridad y caché.
- **`mod_alias`** activo. El `.htaccess` lo usa para que `/.git` y este README
  respondan 404, porque el repositorio se clona dentro de la carpeta pública.
- **Una sola dirección.** `losclaxons.com` sin www y `http://` deben redirigir
  a `https://www.losclaxons.com`. Todas las páginas declaran esa dirección
  como la oficial.
- **Content Security Policy.** Si el servidor define una, debe permitir:
  - `connect-src https://*.supabase.co`, o el formulario no podrá enviar.
  - `style-src https://fonts.googleapis.com` y `font-src https://fonts.gstatic.com`.

`robots.txt` y `sitemap.xml` vienen en este repositorio y permiten indexar
todo el sitio. Si el servidor ya tenía un `robots.txt` propio, este lo sustituye.

## Formulario y base de datos

El formulario se conecta desde el navegador a la API REST de Supabase con la
llave pública (`publishable`), definida en `js/config.js`. No hace falta
Postgres, PHP ni Node en el servidor.

La llave pública solo permite ejecutar la función de registro. La tabla de
participaciones no se puede leer ni modificar con ella.

## Qué hay

```
index.html            la campaña
bases.html            bases de la dinámica
terminos.html         términos y condiciones de Viva Aerobus y uso del sitio
privacidad.html       aviso de privacidad
css/ js/ assets/      estilos, scripts, imágenes y tipografía
robots.txt            permite indexar todo el sitio
sitemap.xml           las cuatro páginas, para los buscadores
.htaccess             cabeceras y bloqueo de archivos internos
assets/.htaccess      caché larga de imágenes y fuentes
```

Este repositorio es la versión publicada. Los cambios se hacen en el
repositorio de trabajo de La Onda y llegan aquí ya revisados. Si necesitan
modificar algo, pídanlo en lugar de editar aquí, para que la siguiente
actualización no lo pise.
