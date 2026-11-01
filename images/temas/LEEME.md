# Imágenes para la página de Temas

Coloca aquí las imágenes editoriales que elijas para las seis disciplinas. La ruta de cada archivo se configura en `data/temas.json`.

Nombres iniciales esperados:

- `ciencia-politica.jpg`
- `Derecho.Port.png`
- `filosofia.jpg`
- `historia.jpg`
- `sociologia.jpg`
- `economia.jpg`

La página recorta las imágenes para adaptarlas a sus tarjetas. Si todavía no hay una imagen para una disciplina, se verá un fondo de color como respaldo.

## Probar una o varias imágenes en una tarjeta

En `data/temas.json`, cada disciplina tiene un campo `imagen` de respaldo y un arreglo `imagenes` para probar la composición principal. Agrega de una a tres rutas al arreglo para comparar:

```json
"imagenes": ["images/temas/derecho-opcion-a.jpg", "images/temas/derecho-opcion-b.jpg"]
```

Una ruta ocupa toda el área; dos la dividen en mitades; tres forman un mosaico con una imagen grande y dos pequeñas. Cambia las rutas del arreglo para activar o retirar opciones. Con `"imagenes": []` se muestra la ruta de `imagen`; si ambos campos quedan vacíos, se muestra el fondo de respaldo.
