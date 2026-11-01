# Bancos de preguntas

Esta carpeta separa los bancos de preguntas del código de la aplicación. Cada archivo describe un curso y contiene bancos por tema. Mantener los datos separados permite actualizar preguntas sin editar la interfaz y facilita añadir carreras/ciclos.

## Organización de archivos

```text
data/examenes/
  bancos.json                 # índice de bancos disponibles
  demo/
    derecho/
      ciclo-i/
        introduccion-al-derecho/
          indice.json          # lista los temas y sus archivos
          temas/
            derecho-y-sociedad.json
            fuentes-del-derecho.json
            interpretacion-juridica.json
            la-norma-juridica.json
            ordenamiento-juridico.json
            relacion-juridica.json
  derecho/                     # futuros bancos reales
    ciclo-i/
      curso-id/
        indice.json
        temas/
          tema-id.json
  economia/
    ciclo-i/
      curso-id/
        indice.json
        temas/
          tema-id.json
```

La página lee carrera, ciclo y curso de los sílabos. `bancos.json` registra los cursos con preguntas y apunta a su `indice.json`. El índice divide el contenido por tema y cada tema vive en su propio archivo. Al abrir la página se leen los índices; los archivos de preguntas solo se cargan cuando se elige un curso. Los cursos sin registro aparecen en el selector, pero no permiten iniciar una práctica vacía. El banco de demostración está bajo `demo/derecho/ciclo-i/introduccion-al-derecho/`; conserva 30 preguntas sintéticas en seis temas y añade 15 preguntas con generación aleatoria en `fundamentos-prueba-aleatoria.json`. Es material de prueba, no representa exámenes oficiales. Esta estructura permite ampliar cada tema de forma independiente.

Al añadir un banco curricular, crea sus archivos bajo `data/examenes/<carrera>/ciclo-<n>/<curso-id>/`, añade la ruta al `bancos.json` y conserva el formato de pregunta. Si la carrera, el ciclo y el curso ya figuran en los sílabos, el selector los mostrará sin modificar la aplicación.

## Registrar un curso y sus temas

Cada entrada de `bancos.json` usa la misma clave que el sílabo y apunta al índice del curso:

```json
{
  "carrera": "derecho",
  "ciclo": 1,
  "cursoId": "introduccion-al-derecho",
  "archivo": "data/examenes/derecho/ciclo-i/introduccion-al-derecho/indice.json",
  "demostracion": false
}
```

El `indice.json` lista los temas disponibles y sus archivos. Sus rutas son relativas a la carpeta del índice:

```json
{
  "carrera": "derecho",
  "ciclo": 1,
  "cursoId": "introduccion-al-derecho",
  "curso": "Introducción al Derecho",
  "temas": [
    { "id": "norma-juridica", "nombre": "Norma jurídica", "archivo": "temas/norma-juridica.json" }
  ]
}
```

El selector se construye desde los sílabos y `bancos.json`: no dupliques listas de cursos en el HTML. Para carreras de muestra, usa `demostracion: true` y mantén sus preguntas fuera de los bancos curriculares.

## Formato de pregunta

Cada pregunta debe tener identificadores estables. La respuesta correcta se guarda por `id`, no por posición, para que la interfaz pueda mezclar opciones sin alterar la corrección.
El tema se hereda del archivo que la contiene y no se repite en cada pregunta.
Si la fuente es común a todo el banco, puede declararse como `fuentePredeterminada` en su índice; una pregunta conserva su propio campo `fuente` cuando necesita citar otra procedencia.

```json
{
  "id": "intro-norma-001",
  "dificultad": "basico",
  "enunciado": "Texto de la pregunta",
  "opciones": [
    { "id": "a", "texto": "Alternativa A" },
    { "id": "b", "texto": "Alternativa B" },
    { "id": "c", "texto": "Alternativa C" },
    { "id": "d", "texto": "Alternativa D" },
    { "id": "e", "texto": "Alternativa E" }
  ],
  "respuestaCorrecta": "b",
  "explicacion": "Justificación breve de la respuesta.",
  "fuente": {
    "tipo": "examen | libro | elaboracion propia",
    "referencia": "Institución, curso, año y página, si aplica"
  }
}
```

No publicar bancos reales hasta revisar que cada pregunta tenga una sola respuesta válida y que la fuente pueda identificarse. Si se adapta una pregunta, indicarlo en la referencia.

### Formato con generación aleatoria de alternativas

Estas preguntas separan dos formulaciones equivalentes de la respuesta correcta, cuatro distractores y la opción fija “Ninguna de las anteriores”. Cada alternativa tiene un ID propio. La aplicación crea una copia para el intento: elige una de las respuestas correctas o ninguna, arma cinco opciones, incluye siempre la opción fija y mezcla el orden. El banco original no se modifica. `fuente.url` es opcional y, si contiene una URL HTTP/HTTPS, aparece como enlace en la explicación y en la revisión.

```json
{
  "id": "intro-aleatoria-001",
  "dificultad": "basico",
  "enunciado": "Texto de la pregunta",
  "respuestasCorrectas": [
    { "id": "correcta-a", "texto": "Primera formulación correcta" },
    { "id": "correcta-b", "texto": "Segunda formulación equivalente" }
  ],
  "distractores": [
    { "id": "distractor-1", "texto": "Alternativa incorrecta" },
    { "id": "distractor-2", "texto": "Alternativa incorrecta" },
    { "id": "distractor-3", "texto": "Alternativa incorrecta" },
    { "id": "distractor-4", "texto": "Alternativa incorrecta" }
  ],
  "opcionNinguna": { "id": "ninguna", "texto": "Ninguna de las anteriores" },
  "explicacion": "Justificación breve.",
  "fuente": {
    "referencia": "Institución, documento y artículo o sección",
    "url": "https://example.org/fuente"
  }
}
```

Los bancos con `opciones` y `respuestaCorrecta` siguen siendo compatibles con el formato anterior.
