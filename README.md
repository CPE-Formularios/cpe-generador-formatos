# Generador de Formatos CPE

Aplicación web estática, sin base de datos y sin almacenamiento de formularios.

## Uso

Abre `index.html` en Chrome o Edge. Desde la portada selecciona **Check List Transporte (SA-014-F)**, diligencia el formato y usa **Generar PDF**. En el cuadro de impresión selecciona **Guardar como PDF**. Los datos no se conservan: guarda el PDF en tu equipo.

## Estructura

- `index.html`: páginas de bienvenida, catálogo y formulario.
- `css/styles.css`: diseño adaptable e impresión.
- `js/app.js`: comportamiento, validaciones y composición de vista imprimible.
- `assets/`: logotipos e imágenes suministradas por el usuario.

Para visualizar correctamente los gráficos, conserva la estructura de carpetas.

## Publicación gratuita en GitHub Pages

Sube **el contenido** de esta carpeta a la raíz de un repositorio de GitHub. En `Settings > Pages`, configura el origen de publicación conforme a las opciones de la cuenta y selecciona la rama y carpeta raíz. GitHub Pages sirve contenido estático; verifica antes que la política institucional permita publicar el material y la marca en un sitio público.

## Seguridad y privacidad

La aplicación funciona en el navegador, sin envío deliberado de respuestas a un servidor. No autentica usuarios ni guarda registros o archivos en un servicio externo. El PDF se crea mediante la función de impresión del navegador. Evita publicar datos sensibles en el repositorio.

## Nota documental

La versión digital reproduce campos y verificaciones del SA-014-F v7. El PDF resultante es una adaptación digital, no una copia exacta del diseño oficial de Word. Validar el uso institucional antes de reemplazar formatos controlados.
