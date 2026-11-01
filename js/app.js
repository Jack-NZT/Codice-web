document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       REFERENCIAS DEL DOM
    ========================================================= */

    const biblioteca =
        document.getElementById("biblioteca");

    const listaAutores =
        document.getElementById("lista-autores");

    const listaTemas =
        document.getElementById("lista-temas");

    const listaColecciones =
        document.getElementById("lista-colecciones");

    const listaSilabos =
        document.getElementById("lista-silabos");

    const silabosCarrera =
        document.getElementById("silabos-carrera");

    const silabosCicloActivo =
        document.getElementById("silabos-ciclo-activo");

    const silabosCarreras =
        document.getElementById("silabos-carreras");

    const silabosIndice =
        document.getElementById("silabos-indice");

    const buscadorForm =
        document.getElementById("buscar-form");

    const filtroTipo =
        document.getElementById("explorar-filtro-tipo");

    const densidadToggle =
        document.getElementById("explorar-densidad");

    const explorarTipo =
        document.getElementById("explorar-tipo");

    const explorarTitulo =
        document.getElementById("explorar-titulo");

    const explorarDescripcion =
        document.getElementById("explorar-descripcion");

    const explorarVolverTemas =
        document.getElementById("explorar-volver-temas");

    const busquedaTitulo =
        document.getElementById("busqueda-titulo");

    const busquedaDescripcion =
        document.getElementById("busqueda-descripcion");

    const recursoTitulo =
        document.getElementById("recurso-titulo");

    const recursoTipo =
        document.getElementById("recurso-tipo");

    const recursoAutor =
        document.getElementById("recurso-autor");

    const recursoPortada =
        document.getElementById("recurso-portada");

    const recursoDescripcion =
        document.getElementById("recurso-descripcion");

    const recursoMetadata =
        document.getElementById("recurso-metadata");

    const recursoRelations =
        document.getElementById("recurso-relations");

    const recursoResumen =
        document.getElementById("recurso-resumen");

    const recursoBiografia =
        document.getElementById("recurso-biografia");

    const recursoAutorTitulo =
        document.getElementById("recurso-autor-titulo");

    const recursoCita =
        document.getElementById("recurso-cita");

    const copiarCita =
        document.getElementById("copiar-cita");

    const recursoArchivo =
        document.getElementById("recurso-archivo");

    const seccionResumen =
        document.getElementById("seccion-resumen");

    const seccionAutor =
        document.getElementById("seccion-autor");

    const seccionCita =
        document.getElementById("seccion-cita");


    let obrasCargadas = [];
    let disciplinasTemas = [];


    /* =========================================================
       ALMACENAMIENTO SEGURO

       localStorage puede lanzar una excepción (cookies bloqueadas,
       algunos modos privados o visores integrados). Sin esta capa,
       esa excepción abortaba todo app.js y la página quedaba en
       blanco. Aquí se degrada: se usan los valores por defecto.
    ========================================================= */

    const almacen = {

        leer(clave) {

            try {
                return localStorage.getItem(clave);
            } catch (error) {
                return null;
            }

        },

        guardar(clave, valor) {

            try {
                localStorage.setItem(clave, valor);
            } catch (error) {
                /* sin almacenamiento: la preferencia no se recuerda */
            }

        }

    };


    function esc(valor) {

        return String(valor ?? "").replace(
            /[&<>"']/g,
            caracter => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[caracter])
        );

    }


    function etiquetaObras(cantidad) {

        return `${cantidad} ${cantidad === 1 ? "obra" : "obras"}`;

    }



    /* =========================================================
       TEMA CLARO / OSCURO
    ========================================================= */

    const themeToggle =
        document.querySelector(".theme-toggle");

    const themeIcon =
        document.querySelector(".theme-toggle-icon");

    const mobileThemeToggle =
        document.getElementById("theme-toggle-mobile");

    const mobileThemeIcon =
        document.querySelector(".theme-toggle-mobile-icon");

    const themeState =
        document.querySelector(".theme-toggle-state");

    const themeColor =
        document.querySelector('meta[name="theme-color"]');


    function aplicarTema(tema) {

        if (tema === "light") {

            document.documentElement.setAttribute(
                "data-theme",
                "light"
            );

        } else {

            document.documentElement.removeAttribute(
                "data-theme"
            );

        }

    }


    function actualizarBotonTema() {

        const esClaro =
            document.documentElement.getAttribute("data-theme") ===
            "light";


        if (themeIcon) {

            themeIcon.textContent =
                esClaro ? "☼" : "◐";

        }

        if (mobileThemeIcon) {

            mobileThemeIcon.textContent =
                esClaro ? "☼" : "◐";

        }


        if (themeState) {

            themeState.textContent =
                esClaro ? "Claro" : "Oscuro";

        }


        if (themeColor) {

            themeColor.setAttribute(
                "content",
                esClaro ? "#f7f4ed" : "#0d0d0c"
            );

        }


        if (themeToggle) {

            /* La etiqueta es fija ("Modo claro") y aria-pressed indica
               si está activo: así no se anuncia dos veces el estado. */

            themeToggle.setAttribute(
                "aria-pressed",
                esClaro ? "true" : "false"
            );

            themeToggle.setAttribute(
                "aria-label",
                "Modo claro"
            );

        }

        if (mobileThemeToggle) {

            mobileThemeToggle.setAttribute(
                "aria-pressed",
                esClaro ? "true" : "false"
            );

            mobileThemeToggle.setAttribute(
                "aria-label",
                "Modo claro"
            );

        }

    }


    const temaGuardado =
        almacen.leer("codice-theme");


    aplicarTema(
        temaGuardado === "light"
            ? "light"
            : "dark"
    );


    actualizarBotonTema();


    /* ---------------------------------------------------------
       Cambio de tema con transición fluida (crossfade).

       Usa View Transitions API cuando el navegador la soporta:
       el comportamiento nativo por defecto de startViewTransition
       ya es un crossfade de toda la pantalla, sin necesidad de
       animaciones personalizadas (sin barrido circular).

       Si el navegador no la soporta (ej. Safari más antiguo),
       cae automáticamente al cambio directo de atributo, que
       igual se ve fluido gracias a las transiciones CSS
       sistemáticas ya declaradas en estilo.css.

       Respeta prefers-reduced-motion: en ese caso se omite
       la View Transition (el propio CSS ya reduce las
       duraciones a ~0 mediante la media query existente).
    --------------------------------------------------------- */

    function alternarTema() {

        const esClaro =
            document.documentElement.getAttribute(
                "data-theme"
            ) === "light";


        const nuevoTema =
            esClaro
                ? "dark"
                : "light";


        const prefiereMenosMovimiento =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        const aplicarCambio = () => {

            aplicarTema(
                nuevoTema
            );


            almacen.guardar(
                "codice-theme",
                nuevoTema
            );


            actualizarBotonTema();

        };


        const soportaViewTransitions =
            typeof document.startViewTransition ===
            "function";


        if (
            soportaViewTransitions &&
            !prefiereMenosMovimiento
        ) {

            document.startViewTransition(
                aplicarCambio
            );

        } else {

            aplicarCambio();

        }

    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            alternarTema
        );

    }

    if (mobileThemeToggle) {

        mobileThemeToggle.addEventListener(
            "click",
            alternarTema
        );

    }


    /* =========================================================
       PARÁMETROS DE URL
    ========================================================= */

    iniciarCabeceraMovil();

    iniciarVista();


    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const coleccion =
        parametros.get("coleccion");

    const autor =
        parametros.get("autor");

    const tema =
        parametros.get("tema");

    const disciplina =
        parametros.get("disciplina");

    const subtema =
        parametros.get("subtema");

    const busqueda =
        parametros.get("q");

    const recursoId =
        parametros.get("id");


    /* =========================================================
       UTILIDADES
    ========================================================= */

    function encontrarObra(id) {

        return obrasCargadas.find(
            obra =>
                obra.id === id
        );

    }


    function crearElemento(etiqueta, clase, texto) {

        const elemento =
            document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;

    }


    function mostrarMensaje(
        contenedor,
        mensaje
    ) {

        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `
            <p class="description">
                ${mensaje}
            </p>
        `;

    }


    /* =========================================================
       CREAR TARJETA DE RECURSO
    ========================================================= */

    function crearTarjeta(
        obra,
        contenedor
    ) {

        if (!contenedor) {
            return;
        }


        const tarjeta =
            document.createElement("a");


        tarjeta.classList.add(
            "resource-card"
        );


        tarjeta.href =
            `recurso.html?id=${encodeURIComponent(obra.id)}`;


        tarjeta.innerHTML = `
            <div class="card-cover">

                ${
                    obra.portada
                        ? `
                            <img
                                src="${esc(obra.portada)}"
                                alt=""
                                loading="lazy"
                                decoding="async"
                            >
                        `
                        : `
                            <div class="card-cover-empty">
                                Sin portada
                            </div>
                        `
                }

            </div>

            <div class="card-info">

                <span class="resource-type">
                    ${esc(obra.tipo)}
                </span>

                <h3>
                    ${esc(obra.titulo)}
                </h3>

                <p class="author">
                    ${esc(obra.autor)}
                </p>

                <span class="metadata">
                    ${esc((obra.temas || []).join(" · "))}
                    ${
                        obra.anio
                            ? " · " + obra.anio
                            : ""
                    }
                </span>

            </div>
        `;


        contenedor.appendChild(
            tarjeta
        );

    }


    /* =========================================================
       GENERAR ÍNDICE DE AUTORES
    ========================================================= */

    function cargarAutores(obras) {

        if (!listaAutores) {
            return;
        }


        const autores =
            [
                ...new Set(
                    obras.map(
                        obra =>
                            obra.autor
                    )
                )
            ].sort();


        listaAutores.innerHTML = "";


        autores.forEach(
            (autor, indice) => {

                const tarjeta =
                    document.createElement("a");


                tarjeta.href =
                    `explorar.html?autor=${encodeURIComponent(autor)}`;


                tarjeta.classList.add(
                    "collection-card"
                );


                tarjeta.innerHTML = `
                    <span>
                        ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <h3>
                        ${esc(autor)}
                    </h3>

                    <p>
                        ${etiquetaObras(obras.filter(o => o.autor === autor).length)} en el archivo.
                    </p>
                `;


                listaAutores.appendChild(
                    tarjeta
                );

            }
        );

    }


    function crearArteTaxonomia(entrada, tipo) {

        const arte = crearElemento("div", "taxonomy-art");
        arte.setAttribute("aria-hidden", "true");

        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 240 160");
        svg.setAttribute("class", `taxonomy-art-svg taxonomy-art-svg--${tipo}`);
        svg.setAttribute("focusable", "false");

        const trazo = document.createElementNS(ns, "path");
        trazo.setAttribute(
            "d",
            tipo === "tema"
                ? "M28 116 72 46 124 91 174 34 218 75M72 46 180 122 218 75M28 116 102 130 124 91"
                : "M18 126 C54 84 78 134 112 86 S168 47 220 28"
        );
        trazo.setAttribute("class", "taxonomy-art-trazo");
        svg.append(trazo);

        const nodos = tipo === "tema"
            ? [[28, 116], [72, 46], [124, 91], [174, 34], [218, 75], [180, 122], [102, 130]]
            : [[18, 126], [76, 112], [112, 86], [164, 57], [220, 28]];

        nodos.forEach(([cx, cy], indice) => {
            const nodo = document.createElementNS(ns, "circle");
            nodo.setAttribute("cx", String(cx));
            nodo.setAttribute("cy", String(cy));
            nodo.setAttribute("r", indice % 3 === 0 ? "3.5" : "2.2");
            nodo.setAttribute("class", "taxonomy-art-nodo");
            svg.append(nodo);
        });

        const mosaico = crearElemento("div", "taxonomy-art-mosaico");
        entrada.obras
            .filter(obra => obra.portada)
            .slice(0, 3)
            .forEach(obra => {
                const imagen = crearElemento("img", "taxonomy-art-portada");
                imagen.src = obra.portada;
                imagen.alt = "";
                imagen.loading = "lazy";
                imagen.decoding = "async";
                imagen.addEventListener("error", () => imagen.remove(), { once: true });
                mosaico.append(imagen);
            });

        arte.append(svg, mosaico);
        return arte;

    }


    function crearTarjetaTaxonomia(entrada, tipo, indice, abrirDetalle) {

        const tarjeta = crearElemento(
            "article",
            `collection-card taxonomy-card taxonomy-card--${tipo}`
        );
        tarjeta.dataset.nombre = entrada.nombre;

        const autores = [...new Set(entrada.obras.map(obra => obra.autor).filter(Boolean))];
        const boton = crearElemento(
            "button",
            "taxonomy-card-action",
            tipo === "coleccion" ? "Explorar ruta" : "Explorar tema"
        );
        boton.type = "button";
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-controls", "taxonomy-detail");
        boton.addEventListener("click", () => abrirDetalle(entrada, tarjeta, boton));

        const cabecera = crearElemento("div", "taxonomy-card-cabecera");
        cabecera.append(
            crearElemento("span", "taxonomy-card-numero", String(indice + 1).padStart(2, "0")),
            boton
        );

        const cuerpo = crearElemento("div", "taxonomy-card-cuerpo");
        cuerpo.append(
            crearElemento("h2", "", entrada.nombre),
            crearElemento(
                "p",
                "taxonomy-card-meta",
                `${etiquetaObras(entrada.obras.length)} · ${autores.length} ${autores.length === 1 ? "autor" : "autores"}`
            )
        );

        tarjeta.append(crearArteTaxonomia(entrada, tipo), cabecera, cuerpo);
        return tarjeta;

    }


    function crearDetalleTaxonomia(entrada, tipo, cerrarDetalle) {

        const autores = [...new Set(entrada.obras.map(obra => obra.autor).filter(Boolean))];
        const panelBase = crearElemento("section", "taxonomy-detail");
        panelBase.id = "taxonomy-detail";
        panelBase.hidden = false;
        panelBase.setAttribute("aria-labelledby", "taxonomy-detail-title");

        const cabecera = crearElemento("div", "taxonomy-detail-cabecera");
        const rotulo = crearElemento(
            "p",
            "eyebrow",
            tipo === "coleccion" ? "RECORRIDO DE LECTURA" : "CONEXIONES TEMÁTICAS"
        );
        const titulo = crearElemento("h2", "", entrada.nombre);
        titulo.id = "taxonomy-detail-title";
        titulo.tabIndex = -1;

        const cerrar = crearElemento("button", "taxonomy-detail-cerrar", "×");
        cerrar.type = "button";
        cerrar.setAttribute("aria-label", "Volver a todas las opciones");
        cerrar.addEventListener("click", cerrarDetalle);
        cabecera.append(
            crearElemento("div", "taxonomy-detail-identidad"),
            cerrar
        );
        cabecera.firstChild.append(rotulo, titulo);

        const contenido = crearElemento("div", "taxonomy-detail-contenido");
        const seccionObras = crearElemento("section", "taxonomy-detail-seccion taxonomy-detail-obras");
        seccionObras.append(
            crearElemento("p", "eyebrow", tipo === "coleccion" ? "EN ESTE RECORRIDO" : "OBRAS RELACIONADAS"),
            crearElemento("h3", "", "Obras")
        );

        const listaObras = crearElemento("div", "taxonomy-detail-lista-obras");
        entrada.obras.slice(0, 4).forEach(obra => {
            const enlace = crearElemento("a", "taxonomy-detail-obra");
            enlace.href = `recurso.html?id=${encodeURIComponent(obra.id)}`;

            if (obra.portada) {
                const imagen = crearElemento("img", "taxonomy-detail-portada");
                imagen.src = obra.portada;
                imagen.alt = "";
                imagen.loading = "lazy";
                imagen.addEventListener("error", () => imagen.remove(), { once: true });
                enlace.append(imagen);
            }

            const datos = crearElemento("span", "taxonomy-detail-obra-datos");
            const meta = [obra.tipo, obra.anio].filter(Boolean).join(" · ");
            datos.append(
                crearElemento("span", "taxonomy-detail-obra-titulo", obra.titulo),
                crearElemento("span", "taxonomy-detail-obra-meta", meta)
            );
            enlace.append(datos, crearElemento("span", "taxonomy-detail-flecha", "↗"));
            listaObras.append(enlace);
        });
        seccionObras.append(listaObras);

        const seccionAutores = crearElemento("section", "taxonomy-detail-seccion taxonomy-detail-autores");
        seccionAutores.append(
            crearElemento("p", "eyebrow", "AUTORES"),
            crearElemento("h3", "", "Voces del archivo")
        );

        const listaAutoresRelacionados = crearElemento("div", "taxonomy-detail-lista-autores");
        autores.slice(0, 8).forEach(autor => {
            const enlace = crearElemento("a", "taxonomy-author-chip", autor);
            enlace.href = `autores.html?a=${encodeURIComponent(autor)}`;
            listaAutoresRelacionados.append(enlace);
        });
        seccionAutores.append(listaAutoresRelacionados);

        const verTodo = crearElemento("a", "taxonomy-detail-todo", "Ver todas las obras →");
        const parametro = tipo === "coleccion" ? "coleccion" : "tema";
        verTodo.href = `explorar.html?${parametro}=${encodeURIComponent(entrada.nombre)}`;

        contenido.append(seccionObras, seccionAutores);
        panelBase.append(cabecera, contenido, verTodo);
        return panelBase;

    }


    function cargarTaxonomia(contenedor, obras, tipo) {

        if (!contenedor) return;

        const nombreCampo = tipo === "coleccion" ? "colecciones" : "temas";
        const entradas = [
            ...new Set(obras.flatMap(obra => obra[nombreCampo] || []))
        ].map(nombre => ({
            nombre,
            obras: obras.filter(obra => (obra[nombreCampo] || []).includes(nombre))
        })).filter(entrada => entrada.obras.length > 0)
            .sort((a, b) => b.obras.length - a.obras.length || a.nombre.localeCompare(b.nombre, "es"));

        contenedor.classList.add("taxonomy-grid");
        contenedor.replaceChildren();

        const opciones = crearElemento("div", "taxonomy-options");
        const panelBase = crearElemento("section", "taxonomy-detail");
        panelBase.id = "taxonomy-detail";
        panelBase.hidden = true;
        panelBase.setAttribute("aria-labelledby", "taxonomy-detail-title");

        let entradaActiva = null;
        let tarjetaActiva = null;
        let botonActivo = null;
        let panel = panelBase;

        function animarMovimiento(tarjeta, rectAntes) {

            if (!tarjeta || !rectAntes || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const rectDespues = tarjeta.getBoundingClientRect();
            if (!rectDespues.width || !rectDespues.height || typeof tarjeta.animate !== "function") return;

            tarjeta.animate(
                [
                    {
                        transformOrigin: "top left",
                        transform: `translate(${rectAntes.left - rectDespues.left}px, ${rectAntes.top - rectDespues.top}px) scale(${rectAntes.width / rectDespues.width}, ${rectAntes.height / rectDespues.height})`
                    },
                    { transformOrigin: "top left", transform: "translate(0, 0) scale(1, 1)" }
                ],
                { duration: 760, easing: "cubic-bezier(.2,.75,.25,1)" }
            );

        }

        function cerrarDetalle({ devolverFoco = true } = {}) {

            if (!entradaActiva) return;

            const tarjeta = tarjetaActiva;
            const boton = botonActivo;
            const rectAntes = tarjeta?.getBoundingClientRect();

            contenedor.classList.remove("is-expanded");
            tarjeta?.classList.remove("is-active");
            boton?.setAttribute("aria-expanded", "false");
            if (boton) boton.hidden = false;
            if (panel) {
                panel.hidden = true;
                panel.replaceChildren();
            }

            entradaActiva = null;
            tarjetaActiva = null;
            botonActivo = null;

            requestAnimationFrame(() => animarMovimiento(tarjeta, rectAntes));
            if (devolverFoco) boton?.focus({ preventScroll: true });

        }

        function abrirDetalle(entrada, tarjeta, boton) {

            if (entradaActiva?.nombre === entrada.nombre) {
                cerrarDetalle();
                return;
            }

            const rectAntes = tarjeta.getBoundingClientRect();

            tarjetaActiva?.classList.remove("is-active");
            botonActivo?.setAttribute("aria-expanded", "false");
            if (botonActivo) botonActivo.hidden = false;
            tarjeta.classList.add("is-active");
            boton.setAttribute("aria-expanded", "true");
            boton.hidden = true;
            contenedor.classList.add("is-expanded");

            entradaActiva = entrada;
            tarjetaActiva = tarjeta;
            botonActivo = boton;

            const panelNuevo = crearDetalleTaxonomia(
                entrada,
                tipo,
                () => cerrarDetalle()
            );
            panel.replaceWith(panelNuevo);
            panel = panelNuevo;

            requestAnimationFrame(() => {
                animarMovimiento(tarjeta, rectAntes);
                const tituloDetalle = panelNuevo.querySelector("#taxonomy-detail-title");
                tituloDetalle?.focus();
                if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof panelNuevo.animate === "function") {
                    panelNuevo.animate(
                        [
                            { opacity: 0, transform: "translateY(12px)" },
                            { opacity: 1, transform: "translateY(0)" }
                        ],
                        { duration: 520, easing: "cubic-bezier(.2,.75,.25,1)" }
                    );
                }
            });

        }

        entradas.forEach((entrada, indice) => {
            opciones.append(crearTarjetaTaxonomia(entrada, tipo, indice, abrirDetalle));
        });

        contenedor.append(opciones, panel);

        contenedor.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && entradaActiva) {
                evento.preventDefault();
                cerrarDetalle();
            }
        });

    }


    function cargarTemas(obras, definiciones) {

        if (!listaTemas) return;

        disciplinasTemas = Array.isArray(definiciones) ? definiciones : [];
        listaTemas.classList.add("taxonomy-grid", "taxonomy-grid--temas");
        listaTemas.replaceChildren();

        const opciones = crearElemento("div", "taxonomy-options");
        let activa = null;
        let detalleActivo = null;
        let disparadorActivo = null;
        let arteActivo = null;
        let copiaActiva = null;
        let tituloOriginalActivo = null;
        let tituloEnlaceActivo = null;

        function posicionesTarjetas() {
            return [...opciones.querySelectorAll(".topic-card")].map(tarjeta => ({
                tarjeta,
                rect: tarjeta.getBoundingClientRect()
            }));
        }

        function animarReordenamiento(posiciones) {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            requestAnimationFrame(() => posiciones.forEach(({ tarjeta, rect }) => {
                const nuevo = tarjeta.getBoundingClientRect();
                if (!nuevo.width || !nuevo.height || typeof tarjeta.animate !== "function") return;
                const dx = rect.left - nuevo.left;
                const dy = rect.top - nuevo.top;
                const sx = rect.width / nuevo.width;
                const sy = rect.height / nuevo.height;
                if (!dx && !dy && sx === 1 && sy === 1) return;
                tarjeta.animate([
                    { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
                    { transformOrigin: "top left", transform: "translate(0, 0) scale(1, 1)" }
                ], { duration: 460, easing: "cubic-bezier(.2,.75,.25,1)" });
            }));
        }

        function cerrar(devolverFoco = true, animar = true) {
            const posiciones = posicionesTarjetas();
            const tarjetaActiva = activa;
            const botonActivo = disparadorActivo;
            if (copiaActiva && tituloEnlaceActivo && tituloOriginalActivo) {
                tituloEnlaceActivo.replaceWith(tituloOriginalActivo);
            }
            detalleActivo?.remove();
            if (tarjetaActiva && botonActivo && arteActivo && copiaActiva) {
                botonActivo.append(arteActivo, copiaActiva);
                tarjetaActiva.prepend(botonActivo);
            }
            activa?.classList.remove("is-active");
            botonActivo?.setAttribute("aria-expanded", "false");
            activa = null;
            detalleActivo = null;
            disparadorActivo = null;
            arteActivo = null;
            copiaActiva = null;
            tituloOriginalActivo = null;
            tituloEnlaceActivo = null;
            listaTemas.classList.remove("topics-expanded");
            if (animar) animarReordenamiento(posiciones);
            if (devolverFoco) botonActivo?.focus({ preventScroll: true });
        }

        function abrir(definicion, tarjeta, boton) {
            if (activa === tarjeta) { cerrar(); return; }
            cerrar(false, false);
            const posiciones = posicionesTarjetas();
            activa = tarjeta;
            tarjeta.classList.add("is-active");
            boton.setAttribute("aria-expanded", "true");

            const arte = boton.querySelector(".topic-card-art");
            const copia = boton.querySelector(".topic-card-copy");
            const tituloOriginal = copia.querySelector(".topic-card-title");
            const tituloEnlace = crearElemento("a", "topic-detail-primary", definicion.nombre);
            tituloEnlace.href = `explorar.html?disciplina=${encodeURIComponent(definicion.id)}`;
            tituloEnlace.setAttribute("aria-label", `Explorar todas las obras de ${definicion.nombre}`);
            const tituloConEnlace = crearElemento("h2", "topic-card-title topic-card-title--link");
            tituloConEnlace.append(tituloEnlace);
            tituloOriginal.replaceWith(tituloConEnlace);
            tarjeta.insertBefore(arte, boton);
            tarjeta.insertBefore(copia, boton);
            boton.remove();
            disparadorActivo = boton;
            arteActivo = arte;
            copiaActiva = copia;
            tituloOriginalActivo = tituloOriginal;
            tituloEnlaceActivo = tituloConEnlace;

            const detalle = crearElemento("section", "topic-expanded-content");
            detalle.id = `topic-detail-${definicion.id}`;
            detalle.setAttribute("aria-label", `Subtemas de ${definicion.nombre}`);
            detalle.setAttribute("aria-live", "polite");
            const descripcion = crearElemento("p", "topic-detail-description", definicion.descripcion);
            const subtitulo = crearElemento("h3", "topic-detail-heading", "Explorar por subtema");
            const lista = crearElemento("div", "topic-subtopics");
            (definicion.subtemas || []).forEach(sub => {
                const enlace = crearElemento("a", "topic-subtopic", sub.nombre);
                enlace.href = `explorar.html?subtema=${encodeURIComponent(sub.id)}`;
                lista.append(enlace);
            });
            const cerrarBoton = crearElemento("button", "taxonomy-detail-cerrar", "×");
            cerrarBoton.type = "button";
            cerrarBoton.setAttribute("aria-label", "Cerrar detalle de disciplina");
            cerrarBoton.addEventListener("click", cerrar);
            const opcionesHeader = crearElemento("div", "topic-expanded-header");
            opcionesHeader.append(subtitulo);
            detalle.append(descripcion, opcionesHeader, lista, cerrarBoton);
            tarjeta.append(detalle);
            detalleActivo = detalle;
            listaTemas.classList.add("topics-expanded");
            tituloEnlace.focus({ preventScroll: true });
            animarReordenamiento(posiciones);
        }

        disciplinasTemas.forEach((definicion, indice) => {
            const tags = (definicion.subtemas || []).flatMap(sub => sub.filtros || []);
            const cantidad = obras.filter(obra => (obra.temas || []).some(tag => tags.includes(tag))).length;
            const tarjeta = crearElemento("article", "taxonomy-card topic-card");
            const boton = crearElemento("button", "topic-card-trigger");
            boton.type = "button";
            boton.setAttribute("aria-expanded", "false");
            boton.setAttribute("aria-controls", `topic-detail-${definicion.id}`);
            boton.setAttribute("aria-label", `Explorar ${definicion.nombre}`);
            boton.addEventListener("click", evento => {
                evento.stopPropagation();
                abrir(definicion, tarjeta, boton);
            });
            tarjeta.addEventListener("click", evento => {
                if (activa === tarjeta && !evento.target.closest("a, button")) cerrar();
            });

            const arte = crearElemento("span", "topic-card-art");
            arte.setAttribute("aria-hidden", "true");
            const imagenes = (Array.isArray(definicion.imagenes) && definicion.imagenes.length
                ? definicion.imagenes
                : [definicion.imagen]).filter(Boolean).slice(0, 3);
            arte.classList.add(`topic-card-art--${imagenes.length || 1}`);
            imagenes.forEach((src, imagenIndice) => {
                const imagen = crearElemento("img", "topic-card-image");
                imagen.src = src;
                imagen.alt = "";
                imagen.loading = "lazy";
                imagen.dataset.imagen = String(imagenIndice + 1);
                imagen.addEventListener("error", () => imagen.remove(), { once: true });
                arte.append(imagen);
            });
            arte.append(crearElemento("span", "topic-card-number", String(indice + 1).padStart(2, "0")));
            const texto = crearElemento("span", "topic-card-copy");
            texto.append(crearElemento("span", "eyebrow", "DISCIPLINA"), crearElemento("h2", "topic-card-title", definicion.nombre));
            texto.append(crearElemento("span", "topic-card-meta", cantidad ? `${etiquetaObras(cantidad)} en el archivo` : "Aún sin obras"));
            boton.append(arte, texto);
            tarjeta.append(boton);
            opciones.append(tarjeta);
        });

        listaTemas.append(opciones);

        listaTemas.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && activa) { cerrar(); }
        });

        const idSolicitado = new URLSearchParams(window.location.search).get("disciplina");
        if (idSolicitado) {
            const indice = disciplinasTemas.findIndex(item => item.id === idSolicitado);
            if (indice >= 0) {
                const tarjeta = opciones.children[indice];
                abrir(disciplinasTemas[indice], tarjeta, tarjeta.querySelector("button"));
            }
        }
    }


    function cargarColecciones(obras) {
        cargarTaxonomia(listaColecciones, obras, "coleccion");
    }


    /* =========================================================
       COLECCIONES DEL INICIO (generadas desde los datos)

       Antes estaban escritas a mano en index.html y dos de las tres
       no existían en los datos (llevaban a una página vacía). Ahora
       se muestran las tres colecciones con más obras.
    ========================================================= */

    function cargarColeccionesInicio(obras) {

        const contenedor =
            document.getElementById("lista-colecciones-inicio");

        if (!contenedor) {
            return;
        }


        const cuentas =
            new Map();

        obras.forEach(
            obra => (obra.colecciones || []).forEach(
                nombre => cuentas.set(
                    nombre,
                    (cuentas.get(nombre) || 0) + 1
                )
            )
        );


        const principales =
            [...cuentas.entries()]
                .sort(
                    (a, b) =>
                        b[1] - a[1] ||
                        a[0].localeCompare(b[0], "es")
                )
                .slice(0, 3);

        if (principales.length === 0) {
            return;
        }


        contenedor.innerHTML = "";

        principales.forEach(
            ([nombre, cantidad], posicion) => {

                const fila =
                    crearElemento("a", "collection-row");

                fila.href =
                    `explorar.html?coleccion=${encodeURIComponent(nombre)}`;

                const flecha =
                    crearElemento("span", "collection-arrow", "→");

                flecha.setAttribute("aria-hidden", "true");

                fila.append(
                    crearElemento(
                        "span",
                        "collection-number",
                        String(posicion + 1).padStart(2, "0")
                    ),
                    crearElemento("span", "collection-name", nombre),
                    crearElemento(
                        "span",
                        "collection-description",
                        etiquetaObras(cantidad)
                    ),
                    flecha
                );

                contenedor.append(fila);

            }
        );

    }


    function iniciarLecturasInicio(obras) {

        const bloque =
            document.querySelector(".home-discover");

        const principal =
            bloque?.querySelector(".discover-main");

        const lista =
            bloque?.querySelector(".discover-list");

        const contador =
            bloque?.querySelector("[data-discover-number]");

        const anterior =
            bloque?.querySelector("[data-discover-prev]");

        const siguiente =
            bloque?.querySelector("[data-discover-next]");

        if (!bloque || !principal || !lista || !contador || !anterior || !siguiente) {
            return;
        }


        const ordenEditorial = [
            "el-principe",
            "la-republica",
            "la-politica-como-vocacion"
        ];

        const lecturas =
            ordenEditorial
                .map(id => obras.find(obra => obra.id === id))
                .filter(obra => obra && obra.portada);

        if (lecturas.length < 2) {
            return;
        }

        bloque.querySelector(".discover-controls")?.removeAttribute("hidden");


        const portada =
            principal.querySelector(".discover-cover img");

        const tipo =
            principal.querySelector(".discover-main-info .eyebrow");

        const titulo =
            principal.querySelector(".discover-main-info h3");

        const autor =
            principal.querySelector(".discover-main-info p:not(.eyebrow)");

        const enlaceTexto =
            principal.querySelector(".discover-main-info > span");

        if (!portada || !tipo || !titulo || !autor || !enlaceTexto) {
            return;
        }


        let indice = 0;
        let punteroDentro = false;
        let focoDentro = false;
        let temporizador = null;


        function crearTarjetaSecundaria(obra) {

            const enlace =
                crearElemento("a", "discover-item");

            enlace.href =
                `recurso.html?id=${encodeURIComponent(obra.id)}`;

            const datos =
                crearElemento("div");

            const etiqueta =
                [obra.tipo, obra.anio].filter(Boolean).join(" · ");

            datos.append(
                crearElemento("p", "eyebrow", etiqueta.toUpperCase()),
                crearElemento("h3", "", obra.titulo),
                crearElemento("p", "", obra.autor)
            );

            const flecha =
                crearElemento("span", "", "→");

            flecha.setAttribute("aria-hidden", "true");
            enlace.append(datos, flecha);

            return enlace;

        }


        function pintarLectura() {

            const obra = lecturas[indice];
            const etiqueta = [obra.tipo, obra.anio].filter(Boolean).join(" · ");

            principal.href =
                `recurso.html?id=${encodeURIComponent(obra.id)}`;

            portada.src = obra.portada;
            portada.alt = `Portada de ${obra.titulo}, de ${obra.autor}`;
            tipo.textContent = etiqueta.toUpperCase();
            titulo.textContent = obra.titulo;
            autor.textContent = obra.autor;
            enlaceTexto.textContent = "Ver obra →";
            contador.textContent =
                `${String(indice + 1).padStart(2, "0")} / ${String(lecturas.length).padStart(2, "0")}`;

            lista.replaceChildren();

            for (let paso = 1; paso < lecturas.length; paso += 1) {
                const otra = lecturas[(indice + paso) % lecturas.length];
                lista.append(crearTarjetaSecundaria(otra));
            }

            principal.classList.remove("is-changing");
            void principal.offsetWidth;
            principal.classList.add("is-changing");
            window.setTimeout(() => principal.classList.remove("is-changing"), 260);

        }


        function puedeRotar() {

            return !punteroDentro &&
                !focoDentro &&
                !document.hidden;

        }


        function sincronizarTemporizador() {

            window.clearInterval(temporizador);
            temporizador = null;

            if (puedeRotar()) {
                temporizador = window.setInterval(avanzar, 6000);
            }

        }


        function avanzar(sentido = 1) {

            indice = (indice + sentido + lecturas.length) % lecturas.length;
            pintarLectura();
            sincronizarTemporizador();

        }


        anterior.addEventListener("click", () => avanzar(-1));
        siguiente.addEventListener("click", () => avanzar(1));

        bloque.addEventListener("pointerenter", () => {
            punteroDentro = true;
            sincronizarTemporizador();
        });

        bloque.addEventListener("pointerleave", () => {
            punteroDentro = false;
            sincronizarTemporizador();
        });

        bloque.addEventListener("focusin", () => {
            focoDentro = true;
            sincronizarTemporizador();
        });

        bloque.addEventListener("focusout", evento => {
            focoDentro = bloque.contains(evento.relatedTarget);
            sincronizarTemporizador();
        });

        document.addEventListener("visibilitychange", sincronizarTemporizador);

        pintarLectura();
        sincronizarTemporizador();

    }


    /* =========================================================
       VISTA DEL CATÁLOGO EN MÓVIL (lista / cuadrícula)

       En pantallas pequeñas la lista es la vista por defecto:
       permite leer títulos y autores de un vistazo. La cuadrícula
       de portadas sigue disponible. El CSS solo aplica estas clases
       por debajo de 700 px; en escritorio no tienen efecto.
    ========================================================= */

    function iniciarVista() {

        const botones =
            document.querySelectorAll(".view-toggle [data-vista]");

        if (!biblioteca || botones.length === 0) {
            return;
        }


        const CLAVE_VISTA =
            "codice-vista";

        function aplicarVista(vista) {

            biblioteca.classList.toggle(
                "is-list",
                vista === "lista"
            );

            biblioteca.classList.toggle(
                "is-grid",
                vista === "cuadricula"
            );

            botones.forEach(
                boton => boton.setAttribute(
                    "aria-pressed",
                    boton.dataset.vista === vista
                        ? "true"
                        : "false"
                )
            );

        }


        aplicarVista(
            almacen.leer(CLAVE_VISTA) === "cuadricula"
                ? "cuadricula"
                : "lista"
        );


        botones.forEach(
            boton => boton.addEventListener(
                "click",
                () => {

                    aplicarVista(boton.dataset.vista);

                    almacen.guardar(
                        CLAVE_VISTA,
                        boton.dataset.vista
                    );

                }
            )
        );

    }


    /* =========================================================
       CABECERA MÓVIL (menú compacto + búsqueda desplegable)

       Por debajo de 960 px la navegación deja de caber en línea.
       La cabecera compacta ofrece búsqueda, tema y menú. El menú
       se despliega como panel superpuesto bajo la cabecera; el
       contenido queda ligeramente atenuado e inerte. Escape, el
       fondo o un enlace lo cierran.
    ========================================================= */

    function iniciarCabeceraMovil() {

        const botonMenu =
            document.getElementById("menu-toggle");

        const navegacion =
            document.getElementById("site-nav");

        const fondoMenu =
            document.getElementById("menu-scrim");

        const botonBuscar =
            document.getElementById("search-shortcut");

        const barraBuscar =
            document.getElementById("mobile-search");

        const campoBuscar =
            document.getElementById("mobile-search-input");

        if (!botonMenu || !navegacion) {
            return;
        }


        const html =
            document.documentElement;

        const escritorio =
            window.matchMedia("(min-width: 960px)");

        const bloqueables =
            [...document.querySelectorAll("main, footer, .skip-link")];


        function menuAbierto() {

            return navegacion.classList.contains("is-open");

        }

        function busquedaAbierta() {

            return Boolean(barraBuscar) && !barraBuscar.hidden;

        }


        function abrirMenu(abrir, devolverFoco = false) {

            navegacion.classList.toggle("is-open", abrir);

            if (fondoMenu) {
                fondoMenu.hidden = !abrir;
            }

            botonMenu.classList.toggle("is-open", abrir);

            botonMenu.setAttribute(
                "aria-expanded",
                abrir ? "true" : "false"
            );

            html.classList.toggle("menu-open", abrir);

            bloqueables.forEach(
                elemento => {
                    elemento.inert = abrir;
                }
            );


            if (abrir) {

                abrirBusqueda(false);

                const primero =
                    navegacion.querySelector("a");

                if (primero) {
                    primero.focus();
                }

            } else if (devolverFoco) {

                botonMenu.focus();

            }

        }


        function abrirBusqueda(abrir, devolverFoco = false) {

            if (!barraBuscar || !botonBuscar) {
                return;
            }

            barraBuscar.hidden = !abrir;

            botonBuscar.setAttribute(
                "aria-expanded",
                abrir ? "true" : "false"
            );


            if (abrir) {

                abrirMenu(false);

                campoBuscar.focus();

            } else if (devolverFoco) {

                botonBuscar.focus();

            }

        }


        botonMenu.addEventListener(
            "click",
            () => abrirMenu(!menuAbierto())
        );

        if (fondoMenu) {

            fondoMenu.addEventListener(
                "click",
                () => abrirMenu(false)
            );

        }

        if (botonBuscar) {

            botonBuscar.addEventListener(
                "click",
                () => abrirBusqueda(!busquedaAbierta())
            );

        }

        navegacion.addEventListener(
            "click",
            evento => {

                if (evento.target.closest("a")) {
                    abrirMenu(false);
                }

            }
        );

        document.addEventListener(
            "keydown",
            evento => {

                if (evento.key !== "Escape") {
                    return;
                }

                if (menuAbierto()) {

                    abrirMenu(false, true);

                } else if (busquedaAbierta()) {

                    abrirBusqueda(false, true);

                }

            }
        );

        document.addEventListener(
            "click",
            evento => {

                if (
                    busquedaAbierta() &&
                    !barraBuscar.contains(evento.target) &&
                    !botonBuscar.contains(evento.target)
                ) {
                    abrirBusqueda(false);
                }

            }
        );

        escritorio.addEventListener(
            "change",
            evento => {

                if (evento.matches) {

                    abrirMenu(false);
                    abrirBusqueda(false);

                }

            }
        );

    }


    /* =========================================================
       BUSCADOR (buscar.html)

       Dos usos en una sola interfaz:
         - Búsqueda simple: escribir y pulsar Enter / flecha.
         - Búsqueda avanzada progresiva: Área y Tipo, después la
           jerarquía académica (Área > Disciplina > Subdisciplina
           > Tema) y, solo si se añaden, criterios bibliográficos.

       Todo es guiado por los datos: un nivel o criterio aparece
       únicamente si al menos una obra tiene ese campo, y cada
       opción muestra cuántas obras dejaría con los demás
       criterios activos (así nunca se llega a cero sin avisar).
       El estado vive en la URL, de modo que una búsqueda se puede
       compartir y el botón "atrás" funciona.
    ========================================================= */

    function normalizarTexto(texto) {

        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    }


    function iniciarBuscador(obras) {

        if (
            !buscadorForm ||
            !biblioteca
        ) {
            return;
        }


        const JERARQUIA =
            ["area", "disciplina", "subdisciplina", "tema"];

        const OPCIONALES =
            ["autor", "anio", "pais", "jurisdiccion", "editorial", "idioma"];

        const SELECTORES =
            ["tipo", "area", "disciplina", "subdisciplina", "tema",
             "autor", "pais", "jurisdiccion", "editorial", "idioma"];

        const ORDEN_CHIPS =
            ["tipo", "area", "disciplina", "subdisciplina", "tema",
             "autor", "anio", "pais", "jurisdiccion", "editorial", "idioma"];

        const ETIQUETAS = {
            tipo: "Tipo",
            area: "Área",
            disciplina: "Disciplina",
            subdisciplina: "Subdisciplina",
            tema: "Tema",
            autor: "Autor",
            anio: "Año",
            pais: "País",
            jurisdiccion: "Jurisdicción",
            editorial: "Editorial",
            idioma: "Idioma"
        };

        const TODOS = {
            tipo: "Todos",
            area: "Todas",
            disciplina: "Todas",
            subdisciplina: "Todas",
            tema: "Todos",
            autor: "Todos",
            pais: "Todos",
            jurisdiccion: "Todas",
            editorial: "Todas",
            idioma: "Todos"
        };


        const campoQ =
            document.getElementById("buscar-q");

        const botonAvanzada =
            document.getElementById("buscar-avanzada-toggle");

        const botonLimpiar =
            document.getElementById("buscar-limpiar");

        const panel =
            document.getElementById("buscar-avanzada");

        const contenedorCampos =
            document.getElementById("buscar-campos");

        const contenedorExtra =
            document.getElementById("buscar-extra");

        const listaChips =
            document.getElementById("buscar-chips");


        /* ---------- Índice de búsqueda (se calcula una vez) ---------- */

        const indice =
            obras.map(
                obra => ({
                    obra,
                    texto: normalizarTexto(
                        [
                            obra.titulo,
                            obra.autor,
                            obra.tipo,
                            obra.descripcion,
                            obra.resumen,
                            obra.editorial,
                            obra.area,
                            obra.disciplina,
                            obra.subdisciplina,
                            ...(obra.temas || []),
                            ...(obra.colecciones || [])
                        ].join(" ")
                    ),
                    titulo: normalizarTexto(obra.titulo),
                    autor: normalizarTexto(obra.autor),
                    etiquetas: normalizarTexto(
                        [
                            ...(obra.temas || []),
                            ...(obra.colecciones || [])
                        ].join(" ")
                    )
                })
            );


        function valores(obra, campo) {

            if (campo === "tema") {

                return Array.isArray(obra.temas)
                    ? obra.temas.filter(Boolean)
                    : [];

            }

            return obra[campo]
                ? [String(obra[campo])]
                : [];

        }


        function anioDe(obra) {

            return parseInt(obra.anio, 10);

        }


        const existentes = {};

        SELECTORES.forEach(
            campo => {

                existentes[campo] =
                    obras.some(
                        obra => valores(obra, campo).length > 0
                    );

            }
        );

        existentes.anio =
            obras.some(
                obra => Number.isFinite(anioDe(obra))
            );


        /* ---------- Estado ---------- */

        const estado = {
            q: "",
            tipo: "",
            area: "",
            disciplina: "",
            subdisciplina: "",
            tema: "",
            autor: "",
            desde: "",
            hasta: "",
            pais: "",
            jurisdiccion: "",
            editorial: "",
            idioma: ""
        };

        const abiertos = new Set();

        let tokens = [];
        let panelAbierto = false;
        let renderizados = new Set();
        let animarPintado = false;
        let chipsBotones = [];


        function fijarConsulta(texto) {

            estado.q =
                String(texto || "").trim();

            tokens =
                normalizarTexto(estado.q)
                    .split(/\s+/)
                    .filter(Boolean);

        }


        function leerAnio(valor) {

            const numero =
                parseInt(valor, 10);

            return Number.isFinite(numero) && numero > 0
                ? String(numero)
                : "";

        }


        function normalizarRango() {

            if (
                estado.desde &&
                estado.hasta &&
                Number(estado.desde) > Number(estado.hasta)
            ) {

                const intercambio =
                    estado.desde;

                estado.desde =
                    estado.hasta;

                estado.hasta =
                    intercambio;

            }

        }


        function dependientes(campo) {

            const posicion =
                JERARQUIA.indexOf(campo);

            return posicion === -1
                ? [campo]
                : JERARQUIA.slice(posicion);

        }


        function coincide(entrada, excluir) {

            if (
                tokens.length > 0 &&
                !tokens.every(
                    token => entrada.texto.includes(token)
                )
            ) {
                return false;
            }


            for (const campo of SELECTORES) {

                if (
                    estado[campo] &&
                    !excluir.includes(campo) &&
                    !valores(entrada.obra, campo).includes(estado[campo])
                ) {
                    return false;
                }

            }


            if (
                (estado.desde || estado.hasta) &&
                !excluir.includes("anio")
            ) {

                const anio =
                    anioDe(entrada.obra);

                if (!Number.isFinite(anio)) {
                    return false;
                }

                if (estado.desde && anio < Number(estado.desde)) {
                    return false;
                }

                if (estado.hasta && anio > Number(estado.hasta)) {
                    return false;
                }

            }

            return true;

        }


        function opcionesDe(campo) {

            const excluir =
                dependientes(campo);

            const cuentas =
                new Map();

            indice.forEach(
                entrada => {

                    if (!coincide(entrada, excluir)) {
                        return;
                    }

                    valores(entrada.obra, campo).forEach(
                        valor => {

                            cuentas.set(
                                valor,
                                (cuentas.get(valor) || 0) + 1
                            );

                        }
                    );

                }
            );

            if (
                estado[campo] &&
                !cuentas.has(estado[campo])
            ) {

                cuentas.set(estado[campo], 0);

            }

            return [...cuentas.entries()]
                .sort(
                    (a, b) => a[0].localeCompare(b[0], "es")
                )
                .map(
                    ([valor, cuenta]) => ({ valor, cuenta })
                );

        }


        function filtrosActivos() {

            return ORDEN_CHIPS.filter(
                campo =>
                    campo === "anio"
                        ? Boolean(estado.desde || estado.hasta)
                        : Boolean(estado[campo])
            );

        }


        function valorDeChip(campo) {

            if (campo !== "anio") {
                return estado[campo];
            }

            if (estado.desde && estado.hasta) {
                return `${estado.desde}–${estado.hasta}`;
            }

            return estado.desde
                ? `desde ${estado.desde}`
                : `hasta ${estado.hasta}`;

        }


        function criterioVisible(campo) {

            const conValor =
                campo === "anio"
                    ? Boolean(estado.desde || estado.hasta)
                    : Boolean(estado[campo]);

            return conValor || abiertos.has(campo);

        }


        function nivelesVisibles() {

            const niveles =
                JERARQUIA.filter(
                    nivel => existentes[nivel]
                );

            return niveles.filter(
                (nivel, posicion) =>
                    posicion === 0 ||
                    estado[niveles[posicion - 1]] !== ""
            );

        }


        function idDeCampo(campo) {

            return campo === "anio"
                ? "buscar-campo-anio-desde"
                : `buscar-campo-${campo}`;

        }


        /* ---------- Acciones ---------- */

        function cambiarSelector(campo, valor) {

            estado[campo] = valor;

            dependientes(campo)
                .slice(1)
                .forEach(
                    nivel => {
                        estado[nivel] = "";
                    }
                );

            actualizar({ foco: idDeCampo(campo) });

        }


        function cambiarAnio() {

            const desde =
                document.getElementById("buscar-campo-anio-desde");

            const hasta =
                document.getElementById("buscar-campo-anio-hasta");

            estado.desde =
                leerAnio(desde ? desde.value : "");

            estado.hasta =
                leerAnio(hasta ? hasta.value : "");

            normalizarRango();

            if (desde) {
                desde.value = estado.desde;
            }

            if (hasta) {
                hasta.value = estado.hasta;
            }

            actualizar({ panel: false });

        }


        function quitarCriterio(campo, opciones = {}) {

            if (campo === "anio") {

                estado.desde = "";
                estado.hasta = "";

            } else {

                dependientes(campo).forEach(
                    nivel => {
                        estado[nivel] = "";
                    }
                );

            }

            abiertos.delete(campo);

            actualizar(opciones);

        }


        function quitarTodos() {

            SELECTORES.forEach(
                campo => {
                    estado[campo] = "";
                }
            );

            estado.desde = "";
            estado.hasta = "";

            abiertos.clear();

            actualizar({ foco: "buscar-avanzada-toggle" });

        }


        function abrirPanel(abrir) {

            panelAbierto = abrir;

            botonAvanzada.setAttribute(
                "aria-expanded",
                abrir ? "true" : "false"
            );

            panel.classList.toggle("is-open", abrir);

        }


        /* ---------- Controles del panel ---------- */

        function crearCampoSelector(campo, opciones, quitable) {

            const id =
                idDeCampo(campo);

            const envoltorio =
                crearElemento("div", "search-field");

            if (
                animarPintado &&
                !renderizados.has(campo)
            ) {

                envoltorio.classList.add("is-new");

            }


            const cabecera =
                crearElemento("div", "search-field-head");

            const etiqueta =
                crearElemento(
                    "label",
                    "search-field-label",
                    ETIQUETAS[campo]
                );

            etiqueta.htmlFor = id;

            cabecera.append(etiqueta);

            if (quitable) {

                const quitar =
                    crearElemento("button", "search-field-remove", "×");

                quitar.type = "button";

                quitar.setAttribute(
                    "aria-label",
                    `Quitar criterio ${ETIQUETAS[campo]}`
                );

                quitar.addEventListener(
                    "click",
                    () => quitarCriterio(
                        campo,
                        { foco: "buscar-agregar" }
                    )
                );

                cabecera.append(quitar);

            }


            const control =
                crearElemento("span", "search-field-control");

            const selector =
                crearElemento("select", "search-field-select");

            selector.id = id;

            const base =
                crearElemento("option", null, TODOS[campo]);

            base.value = "";

            selector.append(base);

            opciones.forEach(
                ({ valor, cuenta }) => {

                    const opcion =
                        crearElemento(
                            "option",
                            null,
                            `${valor} (${cuenta})`
                        );

                    opcion.value = valor;

                    selector.append(opcion);

                }
            );

            selector.value = estado[campo];

            selector.addEventListener(
                "change",
                () => cambiarSelector(campo, selector.value)
            );

            const caret =
                crearElemento("span", "search-field-caret", "▾");

            caret.setAttribute("aria-hidden", "true");

            control.append(selector, caret);

            envoltorio.append(cabecera, control);

            return envoltorio;

        }


        function crearCampoAnio() {

            const envoltorio =
                crearElemento("div", "search-field");

            if (
                animarPintado &&
                !renderizados.has("anio")
            ) {

                envoltorio.classList.add("is-new");

            }


            const cabecera =
                crearElemento("div", "search-field-head");

            const etiqueta =
                crearElemento(
                    "label",
                    "search-field-label",
                    ETIQUETAS.anio
                );

            etiqueta.htmlFor = "buscar-campo-anio-desde";

            const quitar =
                crearElemento("button", "search-field-remove", "×");

            quitar.type = "button";

            quitar.setAttribute(
                "aria-label",
                "Quitar criterio Año"
            );

            quitar.addEventListener(
                "click",
                () => quitarCriterio(
                    "anio",
                    { foco: "buscar-agregar" }
                )
            );

            cabecera.append(etiqueta, quitar);


            const rango =
                crearElemento("div", "search-year");

            function crearEntrada(id, marcador, descripcion, valor) {

                const entrada =
                    crearElemento("input");

                entrada.id = id;
                entrada.type = "number";
                entrada.min = "1";
                entrada.max = "2999";
                entrada.placeholder = marcador;
                entrada.value = valor;

                entrada.setAttribute("inputmode", "numeric");
                entrada.setAttribute("aria-label", descripcion);

                entrada.addEventListener("change", cambiarAnio);

                return entrada;

            }

            rango.append(
                crearEntrada(
                    "buscar-campo-anio-desde",
                    "Desde",
                    "Año desde",
                    estado.desde
                ),
                crearElemento("span", "search-year-sep", "–"),
                crearEntrada(
                    "buscar-campo-anio-hasta",
                    "Hasta",
                    "Año hasta",
                    estado.hasta
                )
            );

            envoltorio.append(cabecera, rango);

            return envoltorio;

        }


        function crearSelectorDeCriterios(disponibles) {

            const envoltorio =
                crearElemento("div", "search-field search-add");

            const control =
                crearElemento("span", "search-field-control");

            const selector =
                crearElemento("select", "search-add-select");

            selector.id = "buscar-agregar";

            selector.setAttribute(
                "aria-label",
                "Añadir criterio de búsqueda"
            );

            const base =
                crearElemento("option", null, "+ Añadir criterio");

            base.value = "";

            selector.append(base);

            disponibles.forEach(
                campo => {

                    const opcion =
                        crearElemento("option", null, ETIQUETAS[campo]);

                    opcion.value = campo;

                    selector.append(opcion);

                }
            );

            selector.addEventListener(
                "change",
                () => {

                    const campo =
                        selector.value;

                    if (!campo) {
                        return;
                    }

                    abiertos.add(campo);

                    actualizar({ foco: idDeCampo(campo) });

                }
            );

            const caret =
                crearElemento("span", "search-field-caret", "▾");

            caret.setAttribute("aria-hidden", "true");

            control.append(selector, caret);

            envoltorio.append(control);

            return envoltorio;

        }


        function pintarPanel() {

            contenedorCampos.innerHTML = "";
            contenedorExtra.innerHTML = "";

            const pintados =
                new Set();

            const niveles =
                nivelesVisibles();

            const orden = [];

            if (niveles.includes("area")) {
                orden.push("area");
            }

            if (existentes.tipo) {
                orden.push("tipo");
            }

            niveles
                .filter(nivel => nivel !== "area")
                .forEach(nivel => orden.push(nivel));


            orden.forEach(
                campo => {

                    const opciones =
                        opcionesDe(campo);

                    if (
                        opciones.length === 0 &&
                        !estado[campo]
                    ) {
                        return;
                    }

                    pintados.add(campo);

                    contenedorCampos.append(
                        crearCampoSelector(campo, opciones, false)
                    );

                }
            );


            OPCIONALES
                .filter(
                    campo =>
                        existentes[campo] &&
                        criterioVisible(campo)
                )
                .forEach(
                    campo => {

                        pintados.add(campo);

                        contenedorExtra.append(
                            campo === "anio"
                                ? crearCampoAnio()
                                : crearCampoSelector(
                                    campo,
                                    opcionesDe(campo),
                                    true
                                )
                        );

                    }
                );


            const disponibles =
                OPCIONALES.filter(
                    campo =>
                        existentes[campo] &&
                        !criterioVisible(campo)
                );

            if (disponibles.length > 0) {

                contenedorExtra.append(
                    crearSelectorDeCriterios(disponibles)
                );

            }

            renderizados = pintados;

        }


        function pintarChips(focoChip) {

            listaChips.innerHTML = "";

            chipsBotones = [];

            filtrosActivos().forEach(
                campo => {

                    const elemento =
                        crearElemento("li", "search-chip-item");

                    const boton =
                        crearElemento("button", "search-chip");

                    boton.type = "button";

                    boton.setAttribute(
                        "aria-label",
                        `Quitar criterio ${ETIQUETAS[campo]}: ${valorDeChip(campo)}`
                    );

                    const posicion =
                        chipsBotones.length;

                    boton.append(
                        crearElemento(
                            "span",
                            "search-chip-key",
                            ETIQUETAS[campo]
                        ),
                        crearElemento(
                            "span",
                            "search-chip-value",
                            valorDeChip(campo)
                        ),
                        crearElemento(
                            "span",
                            "search-chip-x",
                            "×"
                        )
                    );

                    boton.addEventListener(
                        "click",
                        () => quitarCriterio(
                            campo,
                            { focoChip: posicion }
                        )
                    );

                    chipsBotones.push(boton);

                    elemento.append(boton);

                    listaChips.append(elemento);

                }
            );

        }


        function pintarResultados() {

            const activos =
                filtrosActivos().length;

            let resultados =
                indice
                    .filter(entrada => coincide(entrada, []))
                    .map(
                        entrada => ({
                            obra: entrada.obra,
                            puntos: tokens.reduce(
                                (suma, token) =>
                                    suma +
                                    (entrada.titulo.includes(token) ? 3 : 0) +
                                    (entrada.autor.includes(token) ? 2 : 0) +
                                    (entrada.etiquetas.includes(token) ? 1 : 0),
                                0
                            )
                        })
                    );

            if (tokens.length > 0) {

                resultados.sort(
                    (a, b) => b.puntos - a.puntos
                );

            }

            const cantidad =
                resultados.length;


            if (busquedaTitulo) {

                busquedaTitulo.textContent =
                    estado.q
                        ? `Resultados para "${estado.q}"`
                        : activos > 0
                            ? "Resultados filtrados"
                            : "Todos los materiales";

            }

            if (busquedaDescripcion) {

                busquedaDescripcion.textContent =
                    `${cantidad} obra${cantidad === 1 ? "" : "s"} ` +
                    `encontrada${cantidad === 1 ? "" : "s"}` +
                    (
                        activos > 0
                            ? ` · ${activos} criterio${activos === 1 ? "" : "s"} aplicado${activos === 1 ? "" : "s"}.`
                            : " en el archivo."
                    );

            }


            biblioteca.innerHTML = "";

            resultados.forEach(
                ({ obra }) => crearTarjeta(obra, biblioteca)
            );

            if (cantidad === 0) {

                mostrarMensaje(
                    biblioteca,
                    activos > 0
                        ? "No se encontraron obras con estos criterios. Prueba a quitar alguno."
                        : "No se encontraron obras relacionadas con esa búsqueda."
                );

            }

        }


        function escribirURL(modo) {

            const parametros =
                new URLSearchParams();

            if (estado.q) {
                parametros.set("q", estado.q);
            }

            SELECTORES.forEach(
                campo => {

                    if (estado[campo]) {
                        parametros.set(campo, estado[campo]);
                    }

                }
            );

            if (estado.desde) {
                parametros.set("desde", estado.desde);
            }

            if (estado.hasta) {
                parametros.set("hasta", estado.hasta);
            }

            const cadena =
                parametros.toString();

            const destino =
                cadena
                    ? `?${cadena}`
                    : window.location.pathname;

            history[
                modo === "push"
                    ? "pushState"
                    : "replaceState"
            ](null, "", destino);

        }


        function actualizar(
            {
                foco = null,
                focoChip = null,
                historial = "replace",
                panel: repintarPanel = true,
                animar = true
            } = {}
        ) {

            animarPintado = animar;

            if (repintarPanel) {
                pintarPanel();
            }

            pintarChips();
            pintarResultados();

            const activos =
                filtrosActivos().length;

            botonLimpiar.hidden =
                activos === 0;

            buscadorForm.classList.toggle(
                "is-active",
                panelAbierto || activos > 0 || Boolean(estado.q)
            );

            if (historial) {
                escribirURL(historial);
            }

            if (foco) {

                const elemento =
                    document.getElementById(foco);

                if (elemento && elemento.focus) {
                    elemento.focus();
                }

            } else if (focoChip !== null) {

                const destino =
                    chipsBotones[
                        Math.min(
                            focoChip,
                            chipsBotones.length - 1
                        )
                    ];

                (destino || botonAvanzada).focus();

            }

        }


        function leerURL() {

            const parametros =
                new URLSearchParams(window.location.search);

            fijarConsulta(parametros.get("q"));

            SELECTORES.forEach(
                campo => {
                    estado[campo] = parametros.get(campo) || "";
                }
            );

            estado.desde = leerAnio(parametros.get("desde"));
            estado.hasta = leerAnio(parametros.get("hasta"));

            normalizarRango();

            abiertos.clear();

            campoQ.value = estado.q;

            return parametros.get("avanzada") === "1";

        }


        /* ---------- Eventos ---------- */

        buscadorForm.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();

                fijarConsulta(campoQ.value);

                actualizar({ historial: "push", panel: false });

            }
        );

        botonAvanzada.addEventListener(
            "click",
            () => {

                abrirPanel(!panelAbierto);

                actualizar({ historial: null, panel: false });

            }
        );

        botonLimpiar.addEventListener(
            "click",
            quitarTodos
        );

        buscadorForm.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key === "Escape" &&
                    panelAbierto &&
                    panel.contains(document.activeElement)
                ) {

                    abrirPanel(false);

                    actualizar({
                        historial: null,
                        panel: false,
                        foco: "buscar-avanzada-toggle"
                    });

                }

            }
        );

        window.addEventListener(
            "popstate",
            () => {

                const forzarAbierto =
                    leerURL();

                abrirPanel(
                    forzarAbierto ||
                    filtrosActivos().length > 0
                );

                actualizar({ historial: null, animar: false });

            }
        );


        /* ---------- Arranque ---------- */

        const forzarAbierto =
            leerURL();

        abrirPanel(
            forzarAbierto ||
            filtrosActivos().length > 0
        );

        actualizar({ historial: null, animar: false });

    }


    /* =========================================================
       EXPLORAR
    ========================================================= */

    function ejecutarExploracion(obras) {

        if (
            !biblioteca ||
            buscadorForm ||
            busqueda !== null
        ) {
            return;
        }


        let obrasBase =
            obras;


        if (coleccion) {

            obrasBase =
                obras.filter(
                    obra =>
                        obra.colecciones &&
                        obra.colecciones.includes(
                            coleccion
                        )
                );


            configurarExploracion(
                "COLECCIÓN",
                coleccion,
                "Obras reunidas alrededor de esta colección."
            );


        } else if (disciplina || subtema) {

            const definicion = disciplinasTemas.find(item => item.id === disciplina);
            const definicionSubtema = disciplinasTemas
                .flatMap(item => item.subtemas || [])
                .find(item => item.id === subtema);
            const disciplinaSubtema = disciplinasTemas.find(item =>
                (item.subtemas || []).some(sub => sub.id === subtema)
            );
            const filtros = disciplina
                ? (definicion?.subtemas || []).flatMap(item => item.filtros || [])
                : (definicionSubtema?.filtros || []);
            const nombre = disciplina ? (definicion?.nombre || disciplina) : (definicionSubtema?.nombre || subtema);

            obrasBase = obras.filter(obra => (obra.temas || []).some(etiqueta => filtros.includes(etiqueta)));
            configurarExploracion(
                disciplina ? "DISCIPLINA" : "SUBTEMA",
                nombre,
                disciplina
                    ? `Obras clasificadas en ${nombre} y sus subtemas.`
                    : `Obras relacionadas con ${nombre}.`
            );

            if (explorarVolverTemas) {
                explorarVolverTemas.hidden = false;
                explorarVolverTemas.href = disciplina
                    ? `temas.html?disciplina=${encodeURIComponent(disciplina)}`
                    : `temas.html?disciplina=${encodeURIComponent(disciplinaSubtema?.id || "")}`;
            }

        } else if (autor) {

            obrasBase =
                obras.filter(
                    obra =>
                        obra.autor ===
                        autor
                );


            configurarExploracion(
                "AUTOR",
                autor,
                "Obras de este autor presentes en el archivo."
            );


        } else if (tema) {

            obrasBase =
                obras.filter(
                    obra =>
                        obra.temas &&
                        obra.temas.includes(
                            tema
                        )
                );


            configurarExploracion(
                "TEMA",
                tema,
                "Obras relacionadas con este tema."
            );

        }


        /* =========================================================
           FILTRO DE TIPO (barra de herramientas del catálogo)

           Solo existe en explorar.html. Se construye a partir de
           los tipos realmente presentes en obrasBase, así nunca
           aparece una opción que no tenga ningún recurso detrás.
        ========================================================= */

        function pintarCatalogo() {

            const tipoSeleccionado =
                filtroTipo
                    ? filtroTipo.value
                    : "";

            const obrasMostrar =
                tipoSeleccionado
                    ? obrasBase.filter(
                        obra => obra.tipo === tipoSeleccionado
                    )
                    : obrasBase;


            biblioteca.innerHTML = "";


            obrasMostrar.forEach(
                obra => {

                    crearTarjeta(
                        obra,
                        biblioteca
                    );

                }
            );


            if (obrasMostrar.length === 0) {

                mostrarMensaje(
                    biblioteca,
                    "No se encontraron obras relacionadas con este criterio."
                );

            }

        }


        if (filtroTipo) {

            const tipos =
                [
                    ...new Set(
                        obrasBase
                            .map(obra => obra.tipo)
                            .filter(Boolean)
                    )
                ].sort();


            tipos.forEach(
                tipo => {

                    const opcion =
                        document.createElement(
                            "option"
                        );

                    opcion.value =
                        tipo;

                    opcion.textContent =
                        tipo;

                    filtroTipo.appendChild(
                        opcion
                    );

                }
            );


            filtroTipo.addEventListener(
                "change",
                pintarCatalogo
            );

        }


        /* =========================================================
           DENSIDAD DEL CATÁLOGO (5 / 7 columnas)

           Solo existe en explorar.html. Se recuerda entre
           visitas; si no hay preferencia guardada, arranca en
           la vista normal de 5 columnas.
        ========================================================= */

        if (densidadToggle) {

            const CLAVE_DENSIDAD =
                "codice-explorar-densidad";

            const compactoGuardado =
                almacen.leer(
                    CLAVE_DENSIDAD
                ) === "compact";


            function aplicarDensidad(
                compacto
            ) {

                biblioteca.classList.toggle(
                    "is-compact",
                    compacto
                );

                densidadToggle.classList.toggle(
                    "is-compact",
                    compacto
                );

                densidadToggle.setAttribute(
                    "aria-pressed",
                    compacto
                        ? "true"
                        : "false"
                );

            }


            aplicarDensidad(
                compactoGuardado
            );


            densidadToggle.addEventListener(
                "click",
                () => {

                    const compacto =
                        !biblioteca.classList.contains(
                            "is-compact"
                        );

                    aplicarDensidad(
                        compacto
                    );

                    almacen.guardar(
                        CLAVE_DENSIDAD,
                        compacto
                            ? "compact"
                            : "normal"
                    );

                }
            );

        }


        pintarCatalogo();

    }


    function configurarExploracion(
        tipo,
        titulo,
        descripcion
    ) {

        if (explorarTipo) {

            explorarTipo.textContent =
                tipo;

        }

        if (explorarVolverTemas) explorarVolverTemas.hidden = true;


        if (explorarTitulo) {

            explorarTitulo.textContent =
                titulo;

            /* Con colección, autor o tema el título lleva el
               nombre real: se muestra. Solo el «Obras» por
               defecto queda oculto visualmente. */
            explorarTitulo.classList.remove(
                "visually-hidden"
            );

        }


        if (explorarDescripcion) {

            explorarDescripcion.textContent =
                descripcion;

        }

    }


    /* =========================================================
       RECURSO INDIVIDUAL
    ========================================================= */

    function cargarRecurso(obras) {

        if (!recursoTitulo) {
            return;
        }


        const obra =
            obras.find(
                obra =>
                    obra.id ===
                    recursoId
            );


        if (!obra) {

            mostrarRecursoNoEncontrado();

            return;

        }


        cargarDatosPrincipales(
            obra
        );

        cargarMetadatos(
            obra
        );

        cargarRelaciones(
            obra
        );

        cargarPortada(
            obra
        );

        cargarResumen(
            obra
        );

        cargarBiografia(
            obra
        );

        cargarCita(
            obra
        );

        cargarArchivo(
            obra
        );

    }


    function mostrarRecursoNoEncontrado() {

        document.title =
            "Obra no encontrada — Códice";


        if (recursoTipo) {

            recursoTipo.textContent =
                "ERROR";

        }


        recursoTitulo.textContent =
            "Obra no encontrada";


        if (recursoAutor) {

            recursoAutor.textContent =
                "No se encontró el recurso solicitado.";

            recursoAutor.removeAttribute("href");

        }


        if (recursoDescripcion) {

            recursoDescripcion.textContent =
                "Comprueba que el enlace sea correcto.";

        }


        if (recursoRelations) {

            recursoRelations.innerHTML =
                "";

        }


        if (seccionResumen) {

            seccionResumen.style.display =
                "none";

        }


        if (seccionAutor) {

            seccionAutor.style.display =
                "none";

        }


        if (seccionCita) {

            seccionCita.style.display =
                "none";

        }


        if (recursoArchivo) {

            recursoArchivo.style.display =
                "none";

        }


        if (recursoPortada) {

            recursoPortada.style.display =
                "none";

        }

    }


    function cargarDatosPrincipales(obra) {

        document.title =
            `${obra.titulo} — ${obra.autor} · Códice`;


        if (recursoTipo) {

            recursoTipo.textContent =
                obra.tipo;

        }


        recursoTitulo.textContent =
            obra.titulo;


        if (recursoAutor) {

            recursoAutor.textContent =
                obra.autor;

            recursoAutor.href =
                `explorar.html?autor=${encodeURIComponent(obra.autor)}`;

        }


        if (recursoDescripcion) {

            recursoDescripcion.textContent =
                obra.descripcion;

        }

    }


    function cargarMetadatos(obra) {

        if (!recursoMetadata) {
            return;
        }


        let metadata =
            "";


        if (obra.anio) {

            metadata += `
                <p>
                    <span>
                        PUBLICACIÓN
                    </span>
                    ${obra.anio}
                </p>
            `;

        }


        if (obra.editorial) {

            metadata += `
                <p>
                    <span>
                        EDITORIAL
                    </span>
                    ${obra.editorial}
                </p>
            `;

        }


        if (obra.idioma) {

            metadata += `
                <p>
                    <span>
                        IDIOMA
                    </span>
                    ${obra.idioma}
                </p>
            `;

        }


        if (obra.formato) {

            metadata += `
                <p>
                    <span>
                        FORMATO
                    </span>
                    ${obra.formato}
                </p>
            `;

        }


        if (obra.paginas) {

            metadata += `
                <p>
                    <span>
                        PÁGINAS
                    </span>
                    ${obra.paginas}
                </p>
            `;

        }


        if (obra.isbn) {

            metadata += `
                <p>
                    <span>
                        ISBN
                    </span>
                    ${obra.isbn}
                </p>
            `;

        }


        if (obra.estado) {

            metadata += `
                <p>
                    <span>
                        ESTADO
                    </span>
                    ${obra.estado}
                </p>
            `;

        }


        recursoMetadata.innerHTML =
            metadata;

    }


    function cargarRelaciones(obra) {

        if (!recursoRelations) {
            return;
        }


        let contenido =
            "";


        if (
            obra.temas &&
            obra.temas.length > 0
        ) {

            contenido += `
                <div class="relation-group">

                    <span class="relation-label">
                        TEMAS
                    </span>

                    <div class="relation-links">

                        ${obra.temas.map(
                            tema => `
                                <a
                                    href="explorar.html?tema=${encodeURIComponent(tema)}"
                                    class="relation-link"
                                >
                                    ${tema}
                                </a>
                            `
                        ).join("")}

                    </div>

                </div>
            `;

        }


        if (
            obra.colecciones &&
            obra.colecciones.length > 0
        ) {

            contenido += `
                <div class="relation-group">

                    <span class="relation-label">
                        COLECCIONES
                    </span>

                    <div class="relation-links">

                        ${obra.colecciones.map(
                            coleccion => `
                                <a
                                    href="explorar.html?coleccion=${encodeURIComponent(coleccion)}"
                                    class="relation-link"
                                >
                                    ${coleccion}
                                </a>
                            `
                        ).join("")}

                    </div>

                </div>
            `;

        }


        recursoRelations.innerHTML =
            contenido;

    }


    function cargarPortada(obra) {

        if (!recursoPortada) {
            return;
        }


        if (obra.portada) {

            recursoPortada.src =
                obra.portada;

            recursoPortada.alt =
                "Portada de " +
                obra.titulo;

            recursoPortada.style.display =
                "block";

        } else {

            recursoPortada.style.display =
                "none";

        }

    }


    function cargarResumen(obra) {

        if (!recursoResumen) {
            return;
        }


        if (obra.resumen) {

            recursoResumen.textContent =
                obra.resumen;

        } else if (seccionResumen) {

            seccionResumen.style.display =
                "none";

        }

    }


    function cargarBiografia(obra) {

        if (recursoBiografia) {

            if (obra.biografiaAutor) {

                recursoBiografia.textContent =
                    obra.biografiaAutor;

            } else if (seccionAutor) {

                seccionAutor.style.display =
                    "none";

            }

        }


        if (recursoAutorTitulo) {

            recursoAutorTitulo.textContent =
                obra.autor;

        }

    }


    function cargarCita(obra) {

        if (!recursoCita) {
            return;
        }


        const bloqueCita =
            recursoCita.closest(".resource-citation");

        if (obra.citaAPA) {

            recursoCita.textContent =
                obra.citaAPA;

        } else if (bloqueCita) {

            /* Sin cita no tiene sentido mostrar el bloque entero
               (antes quedaba "Cargando referencia..." para siempre). */

            bloqueCita.style.display =
                "none";

        }


        if (
            !copiarCita ||
            !obra.citaAPA
        ) {
            return;
        }


        const estado =
            document.getElementById("copiar-estado");

        const textoOriginal =
            copiarCita.textContent.trim() || "Copiar";

        let temporizador =
            null;


        function copiarConRespaldo(texto) {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                return navigator.clipboard.writeText(texto);
            }

            return new Promise(
                (resolver, rechazar) => {

                    const area =
                        document.createElement("textarea");

                    area.value = texto;
                    area.setAttribute("readonly", "");
                    area.style.position = "fixed";
                    area.style.opacity = "0";

                    document.body.appendChild(area);
                    area.select();

                    const correcto =
                        document.execCommand("copy");

                    area.remove();

                    correcto
                        ? resolver()
                        : rechazar(new Error("copy"));

                }
            );

        }


        copiarCita.addEventListener(
            "click",
            async () => {

                let mensaje;

                try {

                    await copiarConRespaldo(obra.citaAPA);

                    copiarCita.textContent = "Copiada ✓";
                    mensaje = "Cita copiada al portapapeles";

                } catch (error) {

                    copiarCita.textContent = "No se pudo copiar";
                    mensaje = "No se pudo copiar la cita";

                }

                if (estado) {
                    estado.textContent = mensaje;
                }

                clearTimeout(temporizador);

                temporizador = setTimeout(
                    () => {

                        copiarCita.textContent = textoOriginal;

                        if (estado) {
                            estado.textContent = "";
                        }

                    },
                    2200
                );

            }
        );

    }


    function cargarArchivo(obra) {

        if (!recursoArchivo) {
            return;
        }


        const contenedor =
            recursoArchivo.closest(".resource-action");

        let destino =
            null;

        try {

            const direccion =
                new URL(obra.archivo || "");

            if (
                direccion.protocol === "http:" ||
                direccion.protocol === "https:"
            ) {
                destino = direccion;
            }

        } catch (error) {
            destino = null;
        }


        if (destino) {

            recursoArchivo.href =
                destino.href;

            recursoArchivo.target =
                "_blank";

            recursoArchivo.rel =
                "noopener noreferrer";

            recursoArchivo.classList.remove("disabled");

            recursoArchivo.removeAttribute("aria-disabled");

            /* Texto del botón + dominio de destino (se ve en móvil) */

            recursoArchivo.textContent = "";

            const bloqueTexto =
                crearElemento("span", "archive-link-text");

            bloqueTexto.append(
                crearElemento(
                    "span",
                    "archive-link-label",
                    "Abrir documento"
                ),
                crearElemento(
                    "span",
                    "archive-link-dest",
                    destino.hostname.replace(/^www\./, "")
                )
            );

            recursoArchivo.append(bloqueTexto);

            recursoArchivo.style.display =
                "inline-flex";

            if (contenedor) {
                contenedor.classList.remove("is-empty");
            }

            document.body.classList.add("tiene-accion-fija");

        } else {

            recursoArchivo.textContent =
                "Documento próximamente disponible";

            recursoArchivo.removeAttribute("href");
            recursoArchivo.removeAttribute("target");
            recursoArchivo.removeAttribute("rel");

            recursoArchivo.classList.add("disabled");

            recursoArchivo.setAttribute("aria-disabled", "true");

            if (contenedor) {
                contenedor.classList.add("is-empty");
            }

            document.body.classList.remove("tiene-accion-fija");

        }

    }


    /* =========================================================
       SÍLABOS

       Los 12 ciclos son la navegación (índice persistente);
       los cursos de un solo ciclo a la vez son el contenido.
       El ciclo activo se guarda en localStorage y se refleja
       en la URL (#ciclo-N) para permitir enlaces directos y
       el botón atrás/adelante del navegador.
    ========================================================= */

    function cargarSilabos() {

        if (
            !listaSilabos ||
            !silabosIndice
        ) {
            return;
        }


        fetch("data/silabos/carreras.json")

            .then(
                respuesta => {

                    if (!respuesta.ok) {

                        throw new Error(
                            `Error HTTP ${respuesta.status}`
                        );

                    }

                    return respuesta.json();

                }
            )

            .then(
                async carreras => {

                    if (!Array.isArray(carreras) || carreras.length === 0) {
                        throw new Error("El registro de carreras está vacío o no es válido.");
                    }

                    const validas = carreras.filter(c => c && c.id && c.nombre && c.archivo);
                    if (validas.length === 0) {
                        throw new Error("El registro no contiene carreras utilizables.");
                    }

                    const solicitada = new URLSearchParams(window.location.search).get("carrera");
                    const carreraActiva = validas.find(c => c.id === solicitada) || validas[0];

                    if (silabosCarrera) silabosCarrera.textContent = carreraActiva.nombre;
                    document.title = `Sílabos de ${carreraActiva.nombre} — Códice`;

                    if (silabosCarreras) {
                        silabosCarreras.innerHTML = "";
                        validas.forEach(carrera => {
                            const enlace = crearElemento(
                                "a",
                                `syllabus-career-tab${carrera.id === carreraActiva.id ? " is-active" : ""}`
                            );
                            enlace.href = `silabos.html?carrera=${encodeURIComponent(carrera.id)}`;
                            if (carrera.id === carreraActiva.id) enlace.setAttribute("aria-current", "page");
                            enlace.append(crearElemento("span", "syllabus-career-name", carrera.nombre));
                            if (carrera.demo) enlace.append(crearElemento("span", "syllabus-career-demo", "Prueba"));
                            silabosCarreras.append(enlace);
                        });
                    }

                    const respuestaCursos = await fetch(carreraActiva.archivo);
                    if (!respuestaCursos.ok) {
                        throw new Error(`Error HTTP ${respuestaCursos.status} al cargar ${carreraActiva.nombre}.`);
                    }

                    const cursos = await respuestaCursos.json();
                    if (!Array.isArray(cursos) || cursos.length === 0) {
                        mostrarMensaje(listaSilabos, "Aún no hay sílabos publicados para esta carrera.");
                        return;
                    }


                    /* Agrupar por ciclo y ordenar por cicloNumero */

                    const grupos =
                        new Map();

                    cursos.forEach(
                        curso => {

                            if (!grupos.has(curso.ciclo)) {

                                grupos.set(
                                    curso.ciclo,
                                    {
                                        nombre: curso.ciclo,
                                        numero: curso.cicloNumero ?? 999,
                                        cursos: []
                                    }
                                );

                            }

                            grupos.get(curso.ciclo)
                                .cursos.push(curso);

                        }
                    );

                    const ciclos =
                        [...grupos.values()].sort(
                            (a, b) => a.numero - b.numero
                        );

                    if (ciclos.length === 0) {

                        mostrarMensaje(
                            listaSilabos,
                            "Aún no hay sílabos publicados."
                        );

                        return;

                    }


                    const numeros =
                        ciclos.map(c => c.numero);

                    const CLAVE_STORAGE =
                        `codice-silabos-ciclo-${carreraActiva.id}`;

                    let cicloActivo = null;


                    function numeroDesdeHash() {

                        const coincide =
                            window.location.hash.match(
                                /^#ciclo-(\d+)$/
                            );

                        if (!coincide) {
                            return null;
                        }

                        const numero =
                            Number(coincide[1]);

                        return numeros.includes(numero)
                            ? numero
                            : null;

                    }


                    function numeroInicial() {

                        const desdeHash =
                            numeroDesdeHash();

                        if (desdeHash !== null) {
                            return desdeHash;
                        }


                        const preferenciaGuardada = almacen.leer(CLAVE_STORAGE) ||
                            (carreraActiva.id === "derecho" ? almacen.leer("codice-silabos-ciclo") : null);
                        const guardado = Number(preferenciaGuardada);

                        if (numeros.includes(guardado)) {
                            return guardado;
                        }


                        return ciclos[0].numero;

                    }


                    function pintarIndice(activo) {

                        /* El índice se construye una sola vez; después solo
                           se mueve aria-current. Reconstruirlo destruía el
                           enlace enfocado y el foco se perdía (teclado). */

                        if (silabosIndice.children.length === ciclos.length) {

                            silabosIndice
                                .querySelectorAll("[data-ciclo]")
                                .forEach(
                                    enlace => {

                                        if (Number(enlace.dataset.ciclo) === activo) {

                                            enlace.setAttribute(
                                                "aria-current",
                                                "true"
                                            );

                                        } else {

                                            enlace.removeAttribute(
                                                "aria-current"
                                            );

                                        }

                                    }
                                );

                            return;

                        }

                        silabosIndice.innerHTML = "";

                        ciclos.forEach(
                            ciclo => {

                                const enlace =
                                    crearElemento(
                                        "a",
                                        "syllabus-index-link"
                                    );

                                enlace.href =
                                    `#ciclo-${ciclo.numero}`;

                                enlace.dataset.ciclo =
                                    ciclo.numero;

                                enlace.setAttribute(
                                    "aria-label",
                                    ciclo.nombre
                                );

                                if (ciclo.numero === activo) {

                                    enlace.setAttribute(
                                        "aria-current",
                                        "true"
                                    );

                                }

                                enlace.append(
                                    crearElemento(
                                        "span",
                                        "syllabus-index-roman",
                                        ciclo.nombre.split(" ")[0]
                                    )
                                );

                                silabosIndice.append(
                                    enlace
                                );

                            }
                        );

                    }


                    function pintarContenido(activo) {

                        const indiceActivo =
                            ciclos.findIndex(
                                c => c.numero === activo
                            );

                        const ciclo =
                            ciclos[indiceActivo];

                        listaSilabos.innerHTML = "";


                        if (silabosCicloActivo) {
                            silabosCicloActivo.textContent = ciclo.nombre;
                        }

                        const lista =
                            crearElemento(
                                "ol",
                                "syllabus-courses"
                            );

                        ciclo.cursos.forEach(
                            (curso, indiceCurso) => {

                                const fila =
                                    crearElemento(
                                        "li",
                                        "syllabus-course"
                                    );

                                const cuerpo =
                                    crearElemento(
                                        "div",
                                        "syllabus-course-body"
                                    );


const tituloCurso = crearElemento(
    "h3",
    "syllabus-course-name"
);

if (curso.url) {
    const enlaceCurso = crearElemento(
        "a",
        "syllabus-course-link",
        curso.curso
    );

    enlaceCurso.href = curso.url;
    enlaceCurso.target = "_blank";
    enlaceCurso.rel = "noopener noreferrer";
    enlaceCurso.setAttribute(
        "aria-label",
        `Abrir sílabo de ${curso.curso} en una nueva pestaña`
    );

    tituloCurso.append(enlaceCurso);
} else {
    tituloCurso.textContent = curso.curso;
}

cuerpo.append(tituloCurso);


                                /* Bibliografía — solo si hay datos.
                                   No se muestra "—" ni campos vacíos. */

                                const ids =
                                    curso.bibliografia || [];

                                if (curso.descripcion || ids.length > 0) {

                                    const detalles =
                                        crearElemento(
                                            "details",
                                            "syllabus-course-details"
                                        );

                                    const alternarDetalles = crearElemento(
                                        "summary",
                                        "syllabus-course-details-toggle"
                                    );
                                    alternarDetalles.setAttribute(
                                        "aria-label",
                                        `Mostrar información de ${curso.curso}`
                                    );
                                    alternarDetalles.append(
                                        crearElemento(
                                            "span",
                                            "visually-hidden",
                                            `Mostrar información de ${curso.curso}`
                                        )
                                    );

                                    const contenidoDetalles =
                                        crearElemento(
                                            "div",
                                            "syllabus-course-details-content"
                                        );

                                    if (curso.descripcion) {

                                        contenidoDetalles.append(
                                            crearElemento(
                                                "p",
                                                "syllabus-course-description",
                                                curso.descripcion
                                            )
                                        );

                                    }

                                    if (ids.length > 0) {

                                        const bibliografia =
                                            crearElemento(
                                                "p",
                                                "syllabus-course-meta"
                                            );

                                        bibliografia.append(
                                            crearElemento(
                                                "span",
                                                "syllabus-meta-label",
                                                "Bibliografía"
                                            )
                                        );

                                        const enlaces =
                                            crearElemento(
                                                "span",
                                                "relation-links"
                                            );

                                        ids.forEach(
                                            idRecurso => {

                                                const enlace =
                                                    crearElemento(
                                                        "a",
                                                        "relation-link"
                                                    );

                                                const recurso =
                                                    encontrarObra(
                                                        idRecurso
                                                    );

                                                enlace.href =
                                                    `recurso.html?id=${encodeURIComponent(idRecurso)}`;

                                                enlace.textContent =
                                                    recurso
                                                        ? recurso.titulo
                                                        : idRecurso;

                                                enlaces.append(
                                                    enlace
                                                );

                                            }
                                        );

                                        bibliografia.append(
                                            enlaces
                                        );

                                        contenidoDetalles.append(
                                            bibliografia
                                        );

                                    }

                                    detalles.append(
                                        alternarDetalles,
                                        contenidoDetalles
                                    );

                                    detalles.addEventListener("toggle", () => {
                                        alternarDetalles.setAttribute(
                                            "aria-label",
                                            `${detalles.open ? "Ocultar" : "Mostrar"} información de ${curso.curso}`
                                        );
                                    });

                                    cuerpo.append(
                                        detalles
                                    );

                                }


                                fila.append(
                                    crearElemento(
                                        "span",
                                        "syllabus-course-number",
                                        String(indiceCurso + 1).padStart(2, "0")
                                    ),
                                    cuerpo
                                );

                                lista.append(
                                    fila
                                );

                            }
                        );


                        const paginador =
                            crearElemento(
                                "nav",
                                "syllabus-pager"
                            );

                        paginador.setAttribute(
                            "aria-label",
                            "Ciclo anterior y siguiente"
                        );

                        const anterior =
                            ciclos[indiceActivo - 1];

                        const siguiente =
                            ciclos[indiceActivo + 1];

                        if (anterior) {

                            const enlaceAnterior =
                                crearElemento(
                                    "a",
                                    "syllabus-pager-link syllabus-pager-prev",
                                    `← ${anterior.nombre}`
                                );

                            enlaceAnterior.href =
                                `#ciclo-${anterior.numero}`;

                            enlaceAnterior.dataset.ciclo =
                                anterior.numero;

                            paginador.append(
                                enlaceAnterior
                            );

                        }

                        if (siguiente) {

                            const enlaceSiguiente =
                                crearElemento(
                                    "a",
                                    "syllabus-pager-link syllabus-pager-next",
                                    `${siguiente.nombre} →`
                                );

                            enlaceSiguiente.href =
                                `#ciclo-${siguiente.numero}`;

                            enlaceSiguiente.dataset.ciclo =
                                siguiente.numero;

                            paginador.append(
                                enlaceSiguiente
                            );

                        }


                        listaSilabos.append(lista);

                        if (anterior || siguiente) {

                            listaSilabos.append(
                                paginador
                            );

                        }

                    }


                    function activarCiclo(
                        numero,
                        {
                            actualizarHash = true,
                            agregarHistorial = true
                        } = {}
                    ) {

                        if (!numeros.includes(numero)) {
                            return;
                        }

                        if (numero === cicloActivo && !actualizarHash) {
                            return;
                        }

                        pintarIndice(numero);
                        pintarContenido(numero);
                        cicloActivo = numero;

                        if (window.matchMedia("(max-width: 700px)").matches) {

                            const enlaceActivo =
                                silabosIndice.querySelector(
                                    `[data-ciclo="${numero}"]`
                                );

                            if (enlaceActivo) {

                                enlaceActivo.scrollIntoView({
                                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                                        ? "auto"
                                        : "smooth",
                                    block: "nearest",
                                    inline: "center"
                                });

                            }

                        }

                        almacen.guardar(
                            CLAVE_STORAGE,
                            String(numero)
                        );

                        if (actualizarHash) {

                            const hash = `#ciclo-${numero}`;

                            if (window.location.hash !== hash) {

                                const metodo = agregarHistorial
                                    ? "pushState"
                                    : "replaceState";

                                history[metodo](null, "", hash);

                            }

                        }

                    }


                    silabosIndice.addEventListener(
                        "click",
                        evento => {

                            const enlace =
                                evento.target.closest(
                                    "[data-ciclo]"
                                );

                            if (!enlace) {
                                return;
                            }

                            evento.preventDefault();

                            activarCiclo(
                                Number(enlace.dataset.ciclo)
                            );

                        }
                    );

                    listaSilabos.addEventListener(
                        "click",
                        evento => {

                            const enlace =
                                evento.target.closest(
                                    "[data-ciclo]"
                                );

                            if (!enlace) {
                                return;
                            }

                            evento.preventDefault();

                            activarCiclo(
                                Number(enlace.dataset.ciclo)
                            );

                            listaSilabos.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                            if (silabosCicloActivo) {

                                silabosCicloActivo.tabIndex = -1;

                                silabosCicloActivo.focus({
                                    preventScroll: true
                                });

                            }

                        }
                    );

                    window.addEventListener(
                        "hashchange",
                        () => {

                            const numero =
                                numeroDesdeHash();

                            if (numero !== null) {

                                activarCiclo(
                                    numero,
                                    { actualizarHash: false }
                                );

                            }

                        }
                    );

                    window.addEventListener(
                        "popstate",
                        () => {

                            const numero = numeroDesdeHash();

                            if (numero !== null) {

                                activarCiclo(
                                    numero,
                                    { actualizarHash: false }
                                );

                            }

                        }
                    );


                    activarCiclo(
                        numeroInicial(),
                        { agregarHistorial: false }
                    );

                }
            )

            .catch(
                error => {

                    console.error(
                        "Error al cargar los sílabos:",
                        error
                    );


                    mostrarMensaje(
                        listaSilabos,
                        "No se pudieron cargar los sílabos."
                    );

                }
            );

    }


    /* =========================================================
       CARGAR BIBLIOTECA
    ========================================================= */

    Promise.all([
        fetch("data/biblioteca.json").then(respuesta => {
            if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
            return respuesta.json();
        }),
        fetch("data/temas.json").then(respuesta => {
            if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
            return respuesta.json();
        })
    ])
        .then(
            ([obras, definicionesTemas]) => {

                obrasCargadas =
                    Array.isArray(obras)
                        ? obras
                        : [];


                if (!Array.isArray(obras)) {

                    throw new Error(
                        "biblioteca.json no contiene una lista válida."
                    );

                }


                /* =========================
                   ÍNDICES
                ========================= */

                cargarAutores(
                    obras
                );

                cargarTemas(
                    obras,
                    definicionesTemas
                );

                cargarColecciones(
                    obras
                );


                cargarColeccionesInicio(
                    obras
                );

                iniciarLecturasInicio(
                    obras
                );


                /* =========================
                   CONTENIDO DINÁMICO
                ========================= */

                iniciarBuscador(
                    obras
                );

                ejecutarExploracion(
                    obras
                );

                cargarRecurso(
                    obras
                );

                cargarSilabos();

            }
        )

        .catch(
            error => {

                console.error(
                    "Error al cargar la biblioteca:",
                    error
                );


                mostrarMensaje(
                    biblioteca,
                    "No se pudo cargar el archivo de conocimiento."
                );


                mostrarMensaje(
                    listaAutores,
                    "No se pudieron cargar los autores."
                );


                mostrarMensaje(
                    listaTemas,
                    "No se pudieron cargar los temas."
                );


                mostrarMensaje(
                    listaColecciones,
                    "No se pudieron cargar las colecciones."
                );

            }
        );

});
