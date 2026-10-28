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

    const silabosResumen =
        document.getElementById("silabos-resumen");

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


    /* =========================================================
       GENERAR ÍNDICE DE TEMAS
    ========================================================= */

    function cargarTemas(obras) {

        if (!listaTemas) {
            return;
        }


        const temas =
            [
                ...new Set(
                    obras.flatMap(
                        obra =>
                            obra.temas || []
                    )
                )
            ].sort();


        listaTemas.innerHTML = "";


        temas.forEach(
            (tema, indice) => {

                const tarjeta =
                    document.createElement("a");


                tarjeta.href =
                    `explorar.html?tema=${encodeURIComponent(tema)}`;


                tarjeta.classList.add(
                    "collection-card"
                );


                tarjeta.innerHTML = `
                    <span>
                        ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <h3>
                        ${esc(tema)}
                    </h3>

                    <p>
                        ${etiquetaObras(obras.filter(o => (o.temas || []).includes(tema)).length)} en el archivo.
                    </p>
                `;


                listaTemas.appendChild(
                    tarjeta
                );

            }
        );

    }


    /* =========================================================
       GENERAR ÍNDICE DE COLECCIONES
    ========================================================= */

    function cargarColecciones(obras) {

        if (!listaColecciones) {
            return;
        }


        const colecciones =
            [
                ...new Set(
                    obras.flatMap(
                        obra =>
                            obra.colecciones || []
                    )
                )
            ].sort();


        listaColecciones.innerHTML = "";


        colecciones.forEach(
            (coleccion, indice) => {

                const tarjeta =
                    document.createElement("a");


                tarjeta.href =
                    `explorar.html?coleccion=${encodeURIComponent(coleccion)}`;


                tarjeta.classList.add(
                    "collection-card"
                );


                tarjeta.innerHTML = `
                    <span>
                        ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <h3>
                        ${esc(coleccion)}
                    </h3>

                    <p>
                        ${etiquetaObras(obras.filter(o => (o.colecciones || []).includes(coleccion)).length)} en el archivo.
                    </p>
                `;


                listaColecciones.appendChild(
                    tarjeta
                );

            }
        );

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
       CABECERA MÓVIL (menú plegable + búsqueda desplegable)

       Por debajo de 960 px la navegación deja de caber en línea.
       Se muestra una cabecera compacta con dos botones: búsqueda
       y menú. El menú es un panel a pantalla completa; mientras
       está abierto, el resto de la página queda inerte (no recibe
       foco ni clics). Escape lo cierra y devuelve el foco al botón.
    ========================================================= */

    function iniciarCabeceraMovil() {

        const botonMenu =
            document.getElementById("menu-toggle");

        const navegacion =
            document.getElementById("site-nav");

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


        fetch("data/silabos.json")

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
                silabos => {

                    if (
                        !Array.isArray(silabos) ||
                        silabos.length === 0
                    ) {

                        mostrarMensaje(
                            listaSilabos,
                            "Aún no hay sílabos publicados."
                        );

                        return;

                    }


                    const carreras =
                        [
                            ...new Set(
                                silabos
                                    .map(s => s.carrera)
                                    .filter(Boolean)
                            )
                        ];

                    const carreraActiva =
                        carreras[0] || null;

                    const cursos =
                        carreraActiva
                            ? silabos.filter(
                                s => s.carrera === carreraActiva
                            )
                            : silabos;


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


                    /* Cabecera de la página */

                    if (silabosCarrera && carreraActiva) {

                        silabosCarrera.textContent =
                            carreraActiva;

                    }

                    if (silabosResumen) {

                        silabosResumen.textContent =
                            `${cursos.length} curso${cursos.length === 1 ? "" : "s"} · ` +
                            `${ciclos.length} ciclo${ciclos.length === 1 ? "" : "s"}`;

                    }


                    const numeros =
                        ciclos.map(c => c.numero);

                    const CLAVE_STORAGE =
                        "codice-silabos-ciclo";


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


                        const guardado =
                            Number(
                                almacen.leer(
                                    CLAVE_STORAGE
                                )
                            );

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
                                    ),
                                    crearElemento(
                                        "span",
                                        "syllabus-index-count",
                                        `${ciclo.cursos.length}`
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


                        const encabezado =
                            crearElemento(
                                "div",
                                "syllabus-cycle-heading"
                            );

                        encabezado.append(
                            crearElemento(
                                "h2",
                                null,
                                ciclo.nombre
                            ),
                            crearElemento(
                                "span",
                                "syllabus-cycle-heading-count",
                                `${ciclo.cursos.length} curso${ciclo.cursos.length === 1 ? "" : "s"}`
                            )
                        );


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


                                if (curso.descripcion) {

                                    cuerpo.append(
                                        crearElemento(
                                            "p",
                                            "syllabus-course-description",
                                            curso.descripcion
                                        )
                                    );

                                }


                                /* Bibliografía — solo si hay datos.
                                   No se muestra "—" ni campos vacíos. */

                                const ids =
                                    curso.bibliografia || [];

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

                                    cuerpo.append(
                                        bibliografia
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


                        listaSilabos.append(
                            encabezado,
                            lista
                        );

                        if (anterior || siguiente) {

                            listaSilabos.append(
                                paginador
                            );

                        }

                    }


                    function activarCiclo(
                        numero,
                        actualizarHash = true
                    ) {

                        if (!numeros.includes(numero)) {
                            return;
                        }

                        pintarIndice(numero);
                        pintarContenido(numero);
                        sincronizarSelector(numero);

                        almacen.guardar(
                            CLAVE_STORAGE,
                            String(numero)
                        );

                        if (actualizarHash) {

                            history.replaceState(
                                null,
                                "",
                                `#ciclo-${numero}`
                            );

                        }

                    }


                    /* Selector de ciclo para móvil: un <select> nativo
                       (selector del sistema, 16 px, objetivo grande) sustituye
                       a la franja de 12 numerales romanos. En escritorio queda
                       oculto y se usa el índice lateral. */

                    const selectorCiclo =
                        crearElemento("div", "syllabus-picker");

                    const etiquetaSelector =
                        crearElemento(
                            "label",
                            "syllabus-picker-label",
                            "Ciclo académico"
                        );

                    etiquetaSelector.htmlFor =
                        "silabos-selector";

                    const controlSelector =
                        crearElemento("span", "syllabus-picker-control");

                    const selectCiclo =
                        crearElemento("select", "syllabus-picker-select");

                    selectCiclo.id =
                        "silabos-selector";

                    ciclos.forEach(
                        ciclo => {

                            const opcion =
                                crearElemento(
                                    "option",
                                    null,
                                    `${ciclo.nombre} · ${ciclo.cursos.length} cursos`
                                );

                            opcion.value =
                                String(ciclo.numero);

                            selectCiclo.append(opcion);

                        }
                    );

                    const flechaSelector =
                        crearElemento("span", "syllabus-picker-caret", "▾");

                    flechaSelector.setAttribute("aria-hidden", "true");

                    controlSelector.append(selectCiclo, flechaSelector);

                    selectorCiclo.append(etiquetaSelector, controlSelector);

                    silabosIndice.before(selectorCiclo);


                    function sincronizarSelector(numero) {

                        selectCiclo.value =
                            String(numero);

                    }


                    selectCiclo.addEventListener(
                        "change",
                        () => {

                            activarCiclo(
                                Number(selectCiclo.value)
                            );

                            listaSilabos.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }
                    );


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

                            const encabezadoCiclo =
                                listaSilabos.querySelector(
                                    ".syllabus-cycle-heading h2"
                                );

                            if (encabezadoCiclo) {

                                encabezadoCiclo.tabIndex = -1;

                                encabezadoCiclo.focus({
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
                                    false
                                );

                            }

                        }
                    );


                    activarCiclo(
                        numeroInicial()
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

    fetch("data/biblioteca.json")

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
            obras => {

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
                    obras
                );

                cargarColecciones(
                    obras
                );


                cargarColeccionesInicio(
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
