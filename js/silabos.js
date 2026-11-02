document.addEventListener("DOMContentLoaded", async () => {
    const pagina = document.getElementById("ficha-silabo");
    if (!pagina) return;

    const parametros = new URLSearchParams(window.location.search);
    const carreraId = parametros.get("carrera");
    const cursoId = parametros.get("curso");

    const porId = id => document.getElementById(id);
    const crear = (etiqueta, clase, texto) => {
        const nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto !== undefined) nodo.textContent = texto;
        return nodo;
    };

    const icono = (tipo) => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const trazos = {
            lectura: ["M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13H7a2 2 0 0 1-2-2z", "M8 8h7M8 11.5h7M8 15h5", "M18 7h1a2 2 0 0 1 2 2v11h-3"],
            video: ["M4 6.5h16v11H4z", "m10 9 5 3-5 3z"],
            enlace: ["M9.5 14.5 14.5 9.5", "M8 16H6.5a4 4 0 0 1 0-8h4", "M16 8h1.5a4 4 0 0 1 0 8h-4"],
            libro: ["M4 5.5h6a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z", "M20 5.5h-4a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h4z"]
        }[tipo] || [];
        trazos.forEach(d => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            svg.append(path);
        });
        return svg;
    };

    const categoriaDe = tipo => {
        const valor = String(tipo || "").toLocaleLowerCase("es");
        if (["pdf", "lectura", "documento", "documentos"].includes(valor)) return "lectura";
        if (["video", "vídeo", "clase", "audiovisual"].includes(valor)) return "video";
        return "enlace";
    };

    try {
        const respuestaCarreras = await fetch("data/silabos/carreras.json");
        if (!respuestaCarreras.ok) throw new Error("No se pudo cargar el registro de carreras.");
        const carreras = await respuestaCarreras.json();
        const carrera = carreras.find(item => item.id === carreraId);
        if (!carrera) throw new Error("No encontramos la carrera solicitada.");

        const [respuestaCursos, respuestaObras] = await Promise.all([
            fetch(carrera.archivo),
            fetch("data/biblioteca.json")
        ]);
        if (!respuestaCursos.ok) throw new Error("No se pudo cargar el plan de estudios.");
        const cursos = await respuestaCursos.json();
        const curso = cursos.find(item => item.id === cursoId);
        if (!curso) throw new Error("No encontramos esta asignatura en el plan de estudios.");
        const obras = respuestaObras.ok ? await respuestaObras.json() : [];

        const numeroCiclo = Number(curso.cicloNumero) || 1;
        const romano = String(curso.ciclo || "I ciclo").split(" ")[0];
        const regreso = porId("ficha-volver");
        regreso.href = `silabos.html?carrera=${encodeURIComponent(carrera.id)}#ciclo-${numeroCiclo}`;

        porId("ficha-carrera").textContent = carrera.nombre;
        porId("ficha-ciclo").textContent = curso.ciclo || "Ciclo académico";
        porId("ficha-carrera-corta").textContent = carrera.demo ? `${carrera.nombre} · CONTENIDO DE PRUEBA` : `${carrera.nombre} · PLAN DE ESTUDIOS`;
        porId("ficha-titulo").textContent = curso.curso;
        porId("ficha-descripcion").textContent = curso.descripcion || "La descripción de esta asignatura se añadirá próximamente.";
        porId("ficha-ciclo-romano").textContent = romano;
        document.title = `${curso.curso} — Sílabos de ${carrera.nombre} · Códice`;

        const programa = porId("ficha-programa");
        const programaVacio = porId("ficha-programa-vacio");
        if (curso.url) {
            programa.href = curso.url;
            programa.target = "_blank";
            programa.rel = "noopener noreferrer";
            programa.hidden = false;
            programaVacio.hidden = true;
        } else {
            programa.hidden = true;
            programaVacio.hidden = false;
        }

        const material = porId("ficha-recursos");
        const definiciones = [
            { id: "lectura", numero: "01", titulo: "Lecturas y documentos", texto: "PDF, capítulos y material de clase." },
            { id: "video", numero: "02", titulo: "Clases y vídeos", texto: "Explicaciones, conferencias y contenido audiovisual." },
            { id: "enlace", numero: "03", titulo: "Enlaces de interés", texto: "Fuentes y recursos externos seleccionados." }
        ];
        const recursos = Array.isArray(curso.recursos) ? curso.recursos : [];

        definiciones.forEach(definicion => {
            const recursosCategoria = recursos.filter(recurso => categoriaDe(recurso.tipo) === definicion.id);
            const tarjeta = crear("section", `syllabus-material-card${recursosCategoria.length ? " has-resources" : " is-pending"}`);
            const cabecera = crear("div", "syllabus-material-card-top");
            const simbolo = crear("span", "syllabus-material-icon");
            simbolo.append(icono(definicion.id));
            cabecera.append(simbolo, crear("span", "syllabus-material-number", definicion.numero));
            tarjeta.append(
                cabecera,
                crear("h3", "", definicion.titulo),
                crear("p", "syllabus-material-description", definicion.texto)
            );

            if (recursosCategoria.length) {
                const lista = crear("ul", "syllabus-material-list");
                recursosCategoria.forEach(recurso => {
                    const item = crear("li", "syllabus-material-item");
                    const contenido = crear("div", "syllabus-material-item-copy");
                    contenido.append(crear("strong", "", recurso.titulo || "Recurso del curso"));
                    if (recurso.descripcion) contenido.append(crear("small", "", recurso.descripcion));
                    item.append(contenido);
                    if (recurso.url) {
                        const enlace = crear("a", "syllabus-material-open", "Abrir ↗");
                        enlace.href = recurso.url;
                        enlace.target = "_blank";
                        enlace.rel = "noopener noreferrer";
                        enlace.setAttribute("aria-label", `Abrir ${recurso.titulo || "recurso"} en una nueva pestaña`);
                        item.append(enlace);
                    } else {
                        item.append(crear("span", "syllabus-material-pending", "En preparación"));
                    }
                    lista.append(item);
                });
                tarjeta.append(lista);
            } else {
                tarjeta.append(crear("span", "syllabus-material-status", "ESPACIO PARA MATERIAL FUTURO"));
            }
            material.append(tarjeta);
        });

        const idsObras = Array.isArray(curso.bibliografia) ? curso.bibliografia : [];
        const bibliografia = porId("ficha-bibliografia");
        porId("ficha-bibliografia-cantidad").textContent = idsObras.length ? `${idsObras.length} ${idsObras.length === 1 ? "obra" : "obras"}` : "LECTURAS VINCULADAS";

        const relacionadas = idsObras.map(id => obras.find(obra => obra.id === id)).filter(Boolean);
        if (relacionadas.length) {
            relacionadas.forEach(obra => {
                const enlace = crear("a", "syllabus-reading-card");
                enlace.href = `recurso.html?id=${encodeURIComponent(obra.id)}`;
                const portada = crear("span", "syllabus-reading-cover");
                if (obra.portada) {
                    const imagen = crear("img");
                    imagen.src = obra.portada;
                    imagen.alt = `Portada de ${obra.titulo}`;
                    imagen.loading = "lazy";
                    portada.append(imagen);
                } else {
                    portada.append(icono("libro"));
                }
                enlace.append(
                    portada,
                    crear("span", "syllabus-reading-copy", "LECTURA EN CÓDICE"),
                    crear("strong", "", obra.titulo),
                    crear("span", "syllabus-reading-author", obra.autor || "Autor no registrado"),
                    crear("span", "syllabus-reading-arrow", "Abrir obra →")
                );
                bibliografia.append(enlace);
            });
        } else {
            const vacio = crear("div", "syllabus-reading-empty");
            const marca = crear("span", "syllabus-reading-empty-mark");
            marca.append(icono("libro"));
            vacio.append(
                marca,
                crear("div", "", ""),
            );
            const mensaje = vacio.lastElementChild;
            mensaje.append(
                crear("strong", "", "Aún sin obras vinculadas"),
                crear("p", "", "Cuando una lectura del archivo complemente esta asignatura, aparecerá aquí.")
            );
            bibliografia.append(vacio);
        }
    } catch (error) {
        console.error("Error al cargar la ficha del sílabo:", error);
        porId("ficha-titulo").textContent = "Ficha no disponible";
        porId("ficha-descripcion").textContent = error.message || "No pudimos cargar esta asignatura.";
        porId("ficha-recursos").replaceChildren();
        porId("ficha-bibliografia").replaceChildren();
    }
});
