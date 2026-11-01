# Datos de Sílabos

## Añadir una carrera

Registra cada carrera en `carreras.json` con un `id` estable, su nombre visible y la ruta a su archivo de cursos. Si se trata de una versión temporal, añade `"demo": true` para que la interfaz la identifique como prueba.

Guarda los cursos en un archivo JSON independiente por carrera (`derecho.json`, `economia.json`, etc.). Cada curso usa `id`, `ciclo`, `cicloNumero`, `curso`, `descripcion`, `url` y `bibliografia`. Los identificadores de curso deben ser únicos entre carreras.

Deja `url` vacío mientras no exista un sílabo real. `bibliografia` contiene identificadores de obras de `data/biblioteca.json`; no enlaces inventados.

## Economía de prueba

`economia.json` solo valida el selector de carrera, la navegación entre ciclos, la cuadrícula y la apertura de detalles. Sus cursos son marcadores provisionales; sustituye esos registros cuando se cargue el plan real.
