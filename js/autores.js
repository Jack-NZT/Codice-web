/* =========================================================
   CÓDICE — AUTORES (índice + perfil)
   Archivo: js/autores.js · solo se carga en autores.html

   Una sola página, dos vistas:
     autores.html            → índice (retratos)
     autores.html?a=NOMBRE   → perfil del autor

   Datos:
     data/autores.json       → ficha editorial (foto, aportes, obras, enlaces)
     data/citas.json         → citas compartidas por fichas y futura página de citas
     data/biblioteca.json    → obras que ya están en el archivo

   Todo lo "probable" está en CONFIG (más abajo). Para jugar
   con ello en vivo, abre:  autores.html?lab=1
========================================================= */
(function () {
    "use strict";


    /* =====================================================
       INTERRUPTORES  (CONFIG)

       Cada línea es un "interruptor". Cámbialo aquí y
       recarga, o usa el panel de pruebas (?lab=1).
       Para quitar una sección entera: on:false.
    ===================================================== */

    const CONFIG_BASE = {

        foto: {
            mostrar: true,        // false = sin retratos (queda la inicial)
            forma:   "retrato",   // "retrato" (3:4) | "circulo"
            tamano:  "m"          // "s" | "m" | "l"
        },

        indice: {
            estilo: "tarjetas"    // "tarjetas" (con retrato) | "filas" (listado compacto)
        },

        perfil: {
            layout:       "dos-columnas", // "dos-columnas" | "una-columna"
            aportes:      "lista",        // "lista" | "acordeon" | "tarjetas"
            lateralFijo:  false,          // lectura natural de aportes y citas
            ramasEnHero:  true,           // etiquetas de ramas bajo el resumen
            metadatosBajoFoto: true,      // profesión, nacionalidad y fechas
            paginaCitas: null             // activar cuando exista la página general de citas
        },

        /* Orden = orden de aparición dentro de su columna.
           col: "principal" | "lateral"  (en "una-columna" todo va en fila) */
        secciones: {
            aportes:      { on: true, col: "principal" },  // aportes por rama
            relacionados: { on: true, col: "principal" },  // autores que comparten ramas
            obras:        { on: true, col: "lateral"   },  // obras principales (cronología)
            citas:        { on: true, col: "lateral"   },  // citas célebres
            mas:          { on: true, col: "lateral"   }   // ¿Quieres conocer más?
        }
    };


    /* =====================================================
       UTILIDADES
    ===================================================== */

    const CLAVE_LAB = "codice-autores-lab";
    const params = new URLSearchParams(window.location.search);
    const LAB = params.get("lab") === "1";

    const clonar = o => JSON.parse(JSON.stringify(o));
    let CONFIG = clonar(CONFIG_BASE);

    function leerLab() {
        try {
            const guardado = JSON.parse(localStorage.getItem(CLAVE_LAB) || "null");
            if (guardado) CONFIG = fusionar(clonar(CONFIG_BASE), guardado);
        } catch (e) { /* sin almacenamiento: se usan los valores base */ }
    }

    function guardarLab() {
        try { localStorage.setItem(CLAVE_LAB, JSON.stringify(CONFIG)); } catch (e) { /* nada */ }
    }

    function fusionar(base, extra) {
        Object.keys(extra || {}).forEach(k => {
            if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
                fusionar(base[k], extra[k]);
            } else {
                base[k] = extra[k];
            }
        });
        return base;
    }

    function h(etiqueta, clase, texto) {
        const e = document.createElement(etiqueta);
        if (clase) e.className = clase;
        if (texto !== undefined && texto !== null) e.textContent = texto;
        return e;
    }

    function norm(t) {
        return String(t || "").normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    function urlSegura(valor) {
        try {
            const u = new URL(valor);
            return (u.protocol === "http:" || u.protocol === "https:") ? u : null;
        } catch (e) { return null; }
    }

    function iniciales(nombre) {
        const p = String(nombre).trim().split(/\s+/).filter(Boolean);
        if (p.length === 0) return "?";
        if (p.length === 1) return p[0][0].toUpperCase();
        return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    }

    function plural(n, uno, varios) {
        return `${n} ${n === 1 ? uno : varios}`;
    }

    function fechas(p) {
        if (!p) return "";
        if (p.nacimiento && p.fallecimiento) return `${p.nacimiento}–${p.fallecimiento}`;
        if (p.nacimiento) return `n. ${p.nacimiento}`;
        return "";
    }

    /* El texto de ejemplo del JSON ("indica aquí la fuente…") no se
       muestra al público: solo se ven créditos reales. */
    function creditoReal(p) {
        const c = p && p.fotoCredito;
        return c && !/indica aqu/i.test(c) ? c : "";
    }

    function esPerfilCompleto(p) {
        return Boolean(p && (p.resumen || (p.aportes || []).length));
    }


    /* =====================================================
       ESTADO
    ===================================================== */

    const montaje = document.getElementById("autores-app");
    if (!montaje) return;

    let fichas = {};          // autores.json
    let obras = [];           // biblioteca.json
    let citasArchivo = [];    // citas.json: fuente única para citas textuales
    let nombres = [];         // todos los autores (unión de ambas fuentes)

    function obrasDe(nombre) {
        return obras.filter(o => o.autor === nombre);
    }

    function obraEnArchivo(nombre, titulo) {
        const t = norm(titulo);
        return obrasDe(nombre).find(o => norm(o.titulo) === t) || null;
    }

    function ramasDe(nombre) {
        const f = fichas[nombre];
        return f ? (f.aportes || []).map(a => a.rama).filter(Boolean) : [];
    }

    function hrefAutor(nombre) {
        return fichas[nombre] && esPerfilCompleto(fichas[nombre])
            ? `autores.html?a=${encodeURIComponent(nombre)}`
            : `explorar.html?autor=${encodeURIComponent(nombre)}`;
    }


    /* =====================================================
       FOTO  (retrato real o inicial de respaldo)
    ===================================================== */

    function crearFoto(nombre, ficha, clase) {

        const marco = h("div", `aut-foto ${clase || ""}`.trim());
        marco.dataset.forma = CONFIG.foto.forma;

        function monograma() {
            marco.innerHTML = "";
            marco.classList.add("is-vacia");
            const m = h("span", "aut-foto-inicial", iniciales(nombre));
            m.setAttribute("aria-hidden", "true");
            marco.append(m);
        }

        if (CONFIG.foto.mostrar && ficha && ficha.foto) {
            const img = document.createElement("img");
            img.src = ficha.foto;
            img.alt = `Retrato de ${nombre}`;
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("error", monograma);
            marco.append(img);
        } else {
            monograma();
        }

        return marco;
    }


    /* =====================================================
       ÍNDICE
    ===================================================== */

    function pintarIndice() {

        const cab = h("div", "aut-indice-cab");
        cab.append(h("h1", "eyebrow aut-indice-titulo", "ÍNDICE DE AUTORES"));

        const buscar = h("label", "aut-busqueda");
        buscar.setAttribute("aria-label", "Buscar autores por nombre o disciplina");
        const icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icono.setAttribute("viewBox", "0 0 24 24");
        icono.setAttribute("aria-hidden", "true");
        icono.classList.add("aut-busqueda-icono");
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("cx", "10.8");
        circulo.setAttribute("cy", "10.8");
        circulo.setAttribute("r", "6.3");
        const mango = document.createElementNS("http://www.w3.org/2000/svg", "path");
        mango.setAttribute("d", "m15.5 15.5 5 5");
        icono.append(circulo, mango);

        const campo = h("input", "aut-busqueda-campo");
        campo.type = "search";
        campo.placeholder = "Nombre o disciplina…";
        campo.autocomplete = "off";
        campo.setAttribute("aria-label", "Filtrar autores por nombre o disciplina");
        campo.setAttribute("aria-controls", "aut-indice-lista");
        buscar.append(icono, campo);
        cab.append(buscar);

        const lista = h("div", `aut-indice aut-indice--${CONFIG.indice.estilo}`);
        lista.id = "aut-indice-lista";

        nombres.forEach((nombre, i) => {

            const ficha = fichas[nombre];
            const cantidad = obrasDe(nombre).length;
            const ramas = ramasDe(nombre).slice(0, 3);

            const enlace = h("a", "aut-card");
            enlace.href = hrefAutor(nombre);
            enlace.dataset.autor = norm(nombre);
            enlace.dataset.disciplinas = norm(ramasDe(nombre).join(" "));

            if (CONFIG.foto.mostrar) {
                enlace.append(crearFoto(nombre, ficha, "aut-foto--card"));
            }

            const cuerpo = h("div", "aut-card-cuerpo");
            cuerpo.append(h("span", "aut-num", String(i + 1).padStart(2, "0")));
            cuerpo.append(h("h2", "aut-card-nombre", nombre));

            const datos = [fechas(ficha), ficha && ficha.origen].filter(Boolean).join(" · ");
            if (datos) cuerpo.append(h("p", "aut-card-datos", datos));

            if (ramas.length) {
                const r = h("p", "aut-card-ramas", ramas.join(" · "));
                cuerpo.append(r);
            }

            cuerpo.append(h("p", "aut-card-cuenta",
                cantidad > 0
                    ? `${plural(cantidad, "obra", "obras")} en el archivo`
                    : "Sin obras en el archivo todavía"));

            enlace.append(cuerpo);
            lista.append(enlace);
        });

        const vacio = h("p", "aut-indice-vacio", "No encontramos autores con ese nombre o disciplina.");
        vacio.hidden = true;
        campo.addEventListener("input", () => {
            const terminos = norm(campo.value).split(/\s+/).filter(Boolean);
            let visibles = 0;
            lista.querySelectorAll(".aut-card").forEach(tarjeta => {
                const texto = `${tarjeta.dataset.autor} ${tarjeta.dataset.disciplinas}`;
                const coincide = terminos.every(termino => texto.includes(termino));
                tarjeta.hidden = !coincide;
                if (coincide) visibles++;
            });
            vacio.hidden = visibles !== 0;
        });

        montaje.append(cab, lista, vacio);
        document.title = "Autores — Códice";
    }


    /* =====================================================
       PERFIL: secciones
       Cada función devuelve un <section> o null (si no hay
       contenido: la sección simplemente no aparece).
    ===================================================== */

    function seccion(id, titulo, nota) {
        const s = h("section", `aut-sec aut-sec--${id}`);
        const c = h("header", "aut-sec-cab");
        c.append(h("h2", "aut-sec-titulo", titulo));
        if (nota) c.append(h("p", "aut-sec-nota", nota));
        s.append(c);
        return s;
    }


    /* ---- Aportes por rama: el corazón intelectual ---- */

    function secAportes(nombre) {

        const aportes = (fichas[nombre] && fichas[nombre].aportes) || [];
        if (aportes.length === 0) return null;

        const s = seccion("aportes", "Aportes principales",
            "Por rama del conocimiento.");

        const caja = h("div", `aut-aportes aut-aportes--${CONFIG.perfil.aportes}`);

        aportes.forEach((a, i) => {

            if (CONFIG.perfil.aportes === "acordeon") {
                const d = document.createElement("details");
                d.className = "aut-aporte";
                if (i === 0) d.open = true;
                const sm = document.createElement("summary");
                sm.className = "aut-aporte-rama";
                sm.textContent = a.rama;
                d.append(sm, h("p", "aut-aporte-texto", a.texto));
                caja.append(d);
            } else {
                const d = h("article", "aut-aporte");
                d.append(
                    h("h3", "aut-aporte-rama", a.rama),
                    h("p", "aut-aporte-texto", a.texto)
                );
                caja.append(d);
            }
        });

        s.append(caja);
        return s;
    }


    /* ---- Obras principales: cronología ---- */

    function secObras(nombre) {

        const lista = (fichas[nombre] && fichas[nombre].obras) || [];
        if (lista.length === 0) return null;

        const s = seccion("obras", "Obras principales");
        const ol = h("ol", "aut-obras");

        const ordenadas = lista.map((o, indice) => ({
            o,
            indice,
            enArchivo: (o.id && obras.find(obra => obra.id === o.id)) || obraEnArchivo(nombre, o.titulo)
        })).sort((a, b) => {
            const aDisponible = a.enArchivo && a.enArchivo.estado === "Disponible";
            const bDisponible = b.enArchivo && b.enArchivo.estado === "Disponible";
            return Number(bDisponible) - Number(aDisponible) || a.indice - b.indice;
        });

        ordenadas.forEach(({ o, enArchivo }) => {
            const disponible = Boolean(enArchivo && enArchivo.estado === "Disponible");
            const li = h("li", disponible ? "aut-obra aut-obra--disponible" : "aut-obra");
            li.append(h("span", "aut-obra-anio", o.anio || "—"));

            if (disponible) {
                const enlace = h("a", "aut-obra-cuerpo aut-obra-cuerpo--enlace");
                enlace.href = `recurso.html?id=${encodeURIComponent(enArchivo.id)}`;
                enlace.append(
                    h("span", "aut-obra-titulo aut-obra-enlace", o.titulo),
                    h("span", "aut-obra-marca", "Disponible en Códice")
                );
                li.append(enlace);
            } else {
                const cuerpo = h("div", "aut-obra-cuerpo");
                if (enArchivo) {
                    const a = h("a", "aut-obra-titulo", o.titulo);
                    a.href = `recurso.html?id=${encodeURIComponent(enArchivo.id)}`;
                    cuerpo.append(a, h("span", "aut-obra-marca", "Próximamente"));
                } else {
                    cuerpo.append(h("span", "aut-obra-titulo", o.titulo));
                }
                li.append(cuerpo);
            }

            ol.append(li);
        });

        s.append(ol);
        return s;
    }


    /* ---- Citas ---- */

    function secCitas(nombre) {

        const ficha = fichas[nombre] || {};
        const citas = citasArchivo.filter(c =>
            (c.autorId && ficha.id && c.autorId === ficha.id) ||
            (!c.autorId && c.autor === nombre)
        );
        if (citas.length === 0) return null;

        const s = seccion("citas", "Citas principales");
        citas.forEach(c => {
            const bq = h("blockquote", "aut-cita");
            bq.append(h("p", "aut-cita-texto", c.texto));

            const obra = c.obra || {};
            const registro = obra.id && obras.find(o => o.id === obra.id);
            const fuente = h("footer", "aut-cita-fuente");

            if (registro) {
                const enlace = h("a", "aut-cita-obra", registro.titulo || obra.titulo);
                enlace.href = `recurso.html?id=${encodeURIComponent(registro.id)}`;
                fuente.append(enlace);
            } else if (obra.titulo) {
                fuente.append(h("span", "aut-cita-obra", obra.titulo));
            }

            const detalles = [
                obra.anio,
                c.edicion,
                c.pagina ? `p. ${c.pagina}` : ""
            ].filter(Boolean).join(" · ");
            if (detalles) fuente.append(h("span", "aut-cita-detalles", detalles));

            const referencia = c.referencia || c.fuente;
            if (referencia && !obra.titulo) fuente.append(h("span", "aut-cita-detalles", referencia));
            if (fuente.children.length) bq.append(fuente);
            s.append(bq);
        });

        if (CONFIG.perfil.paginaCitas) {
            const mas = h("a", "aut-citas-mas", "Explorar más citas →");
            const destino = new URL(CONFIG.perfil.paginaCitas, window.location.href);
            destino.searchParams.set("autor", ficha.id || nombre);
            mas.href = destino.href;
            s.append(mas);
        }
        return s;
    }


    /* ---- ¿Quieres conocer más? ---- */

    function secMas(nombre) {

        const enlaces = fuentesDeFicha(fichas[nombre] || {});

        if (enlaces.length === 0) return null;

        const s = seccion("mas", "¿Quieres conocer más?",
            "Lecturas y bibliografías fuera de Códice.");

        const ul = h("ul", "aut-mas");
        enlaces.forEach(e => {
            const li = h("li");
            const a = h("a", "aut-mas-enlace");
            a.href = e.u.href;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.append(h("span", "aut-mas-titulo", e.titulo || e.u.hostname));
            if (e.descripcion && !/sustituye|completa con|indica aquí|placeholder/i.test(e.descripcion)) {
                a.append(h("span", "aut-mas-desc", e.descripcion));
            }
            a.append(h("span", "aut-mas-host", e.u.hostname.replace(/^www\./, "")));
            li.append(a);
            ul.append(li);
        });
        s.append(ul);
        return s;
    }


    function fuentesDeFicha(ficha) {
        return ((ficha && ficha.masInformacion) || [])
            .map(e => ({ ...e, u: urlSegura(e.url) }))
            .filter(e => e.u);
    }


    function tipoFuente(enlace) {
        const tipo = norm(enlace.tipo || "");
        const host = norm(enlace.u.hostname);
        const titulo = norm(enlace.titulo || "");
        if (/youtube|youtu\.be|video/.test(`${tipo} ${host} ${titulo}`)) return "youtube";
        if (/bibliog|catalogo|libro/.test(`${tipo} ${titulo}`)) return "bibliografia";
        return "web";
    }


    function iconoFuente(tipo) {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.classList.add("aut-fuente-icono", `aut-fuente-icono--${tipo}`);

        if (tipo === "youtube") {
            const caja = document.createElementNS(ns, "rect");
            caja.setAttribute("x", "3"); caja.setAttribute("y", "5");
            caja.setAttribute("width", "18"); caja.setAttribute("height", "14");
            caja.setAttribute("rx", "4");
            const play = document.createElementNS(ns, "path");
            play.setAttribute("d", "m10 9 5 3-5 3z");
            svg.append(caja, play);
        } else if (tipo === "bibliografia") {
            const libro = document.createElementNS(ns, "path");
            libro.setAttribute("d", "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22zM4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h8");
            svg.append(libro);
        } else {
            const circulo = document.createElementNS(ns, "circle");
            circulo.setAttribute("cx", "12"); circulo.setAttribute("cy", "12");
            circulo.setAttribute("r", "9");
            const meridiano = document.createElementNS(ns, "ellipse");
            meridiano.setAttribute("cx", "12"); meridiano.setAttribute("cy", "12");
            meridiano.setAttribute("rx", "4"); meridiano.setAttribute("ry", "9");
            const paralelo = document.createElementNS(ns, "path");
            paralelo.setAttribute("d", "M3 12h18M5 7h14M5 17h14");
            svg.append(circulo, meridiano, paralelo);
        }
        return svg;
    }


    function accionFuentes(nombre, ficha) {
        const enlaces = fuentesDeFicha(ficha);

        if (enlaces.length === 0) {
            const directo = h("a", "aut-btn aut-btn--principal", "Ver en Wikipedia ↗");
            directo.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(nombre.replace(/\s+/g, "_"))}`;
            directo.target = "_blank";
            directo.rel = "noopener noreferrer";
            return { elemento: directo, capa: null };
        }

        const boton = h("button", "aut-btn aut-btn--principal", "Conocer más");
        boton.type = "button";
        boton.setAttribute("aria-haspopup", "dialog");
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-controls", "aut-fuentes-panel");

        const capa = h("div", "aut-fuentes-capa");
        capa.setAttribute("aria-hidden", "true");
        const panel = h("aside", "aut-fuentes-panel");
        panel.id = "aut-fuentes-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", "aut-fuentes-titulo");
        panel.tabIndex = -1;

        const cabecera = h("header", "aut-fuentes-cab");
        const titulo = h("div", "aut-fuentes-cab-texto");
        titulo.append(h("p", "eyebrow", "FUENTES Y RECURSOS"));
        titulo.append(h("h2", "aut-fuentes-titulo", `Conocer más sobre ${nombre}`));
        titulo.lastChild.id = "aut-fuentes-titulo";
        const cerrar = h("button", "aut-fuentes-cerrar", "×");
        cerrar.type = "button";
        cerrar.setAttribute("aria-label", "Cerrar fuentes");
        cabecera.append(titulo, cerrar);

        const lista = h("div", "aut-fuentes-lista");
        enlaces.forEach(enlace => {
            const tipo = tipoFuente(enlace);
            const tarjeta = h("a", `aut-fuente aut-fuente--${tipo}`);
            tarjeta.href = enlace.u.href;
            tarjeta.target = "_blank";
            tarjeta.rel = "noopener noreferrer";

            const icono = h("span", "aut-fuente-icono-marco");
            icono.append(iconoFuente(tipo));
            const texto = h("span", "aut-fuente-texto");
            texto.append(
                h("span", "aut-fuente-tipo", tipo === "youtube" ? "Video" : tipo === "bibliografia" ? "Bibliografía" : "Sitio web"),
                h("span", "aut-fuente-nombre", enlace.titulo || enlace.u.hostname)
            );
            if (enlace.descripcion && !/sustituye|completa con|indica aquí|placeholder/i.test(enlace.descripcion)) {
                texto.append(h("span", "aut-fuente-descripcion", enlace.descripcion));
            }
            const flecha = h("span", "aut-fuente-flecha", "↗");
            flecha.setAttribute("aria-hidden", "true");
            tarjeta.append(icono, texto, flecha);
            lista.append(tarjeta);
        });

        panel.append(cabecera, lista);
        capa.append(panel);
        let abierto = false;
        function cerrarPanel() {
            if (!abierto) return;
            abierto = false;
            capa.classList.remove("is-abierta");
            capa.setAttribute("aria-hidden", "true");
            boton.setAttribute("aria-expanded", "false");
            document.body.classList.remove("aut-fuentes-abiertas");
            boton.focus();
        }

        function manejarTeclado(evento) {
            if (!abierto) return;
            if (evento.key === "Escape") {
                evento.preventDefault();
                cerrarPanel();
                return;
            }
            if (evento.key !== "Tab") return;
            const focos = [...panel.querySelectorAll("a[href], button:not([disabled])")];
            const primero = focos[0];
            const ultimo = focos[focos.length - 1];
            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault(); ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault(); primero.focus();
            }
        }

        cerrar.addEventListener("click", cerrarPanel);
        capa.addEventListener("click", evento => {
            if (evento.target === capa) cerrarPanel();
        });
        panel.addEventListener("keydown", manejarTeclado);
        boton.addEventListener("click", () => {
            abierto = true;
            capa.setAttribute("aria-hidden", "false");
            capa.classList.add("is-abierta");
            boton.setAttribute("aria-expanded", "true");
            document.body.classList.add("aut-fuentes-abiertas");
            cerrar.focus();
        });

        return { elemento: boton, capa };
    }


    /* ---- Relacionados: comparten ramas ---- */

    function secRelacionados(nombre) {

        const mias = ramasDe(nombre).map(norm);
        if (mias.length === 0) return null;

        const afines = nombres
            .filter(n => n !== nombre)
            .map(n => ({
                n,
                comunes: ramasDe(n).filter(r => mias.includes(norm(r)))
            }))
            .filter(x => x.comunes.length > 0);

        if (afines.length === 0) return null;

        const s = seccion("relacionados", "Dialoga con",
            "Autores del archivo que trabajan en las mismas ramas.");

        const ul = h("ul", "aut-afines");
        afines.forEach(({ n, comunes }) => {
            const li = h("li");
            const a = h("a", "aut-afin");
            a.href = hrefAutor(n);
            a.append(
                crearFoto(n, fichas[n], "aut-foto--mini"),
                h("span", "aut-afin-nombre", n),
                h("span", "aut-afin-rama", comunes.join(" · "))
            );
            li.append(a);
            ul.append(li);
        });
        s.append(ul);
        return s;
    }


    const CONSTRUCTORES = {
        aportes:      secAportes,
        relacionados: secRelacionados,
        obras:        secObras,
        citas:        secCitas,
        mas:          secMas
    };


    /* =====================================================
       PERFIL: composición
    ===================================================== */

    function pintarPerfil(nombre) {

        const ficha = fichas[nombre] || {};
        const propias = obrasDe(nombre);

        document.title = `${nombre} — Autores · Códice`;

        /* Regreso al índice, visible solo en la ficha individual. */
        const volver = h("a", "aut-volver");
        volver.href = "autores.html";
        volver.setAttribute("aria-label", "Volver al índice de autores");
        volver.append(
            h("span", "aut-volver-flecha", "←"),
            document.createTextNode("Autores")
        );

        /* Cabecera: identidad a la izquierda, obras a la derecha */
        const hero = h("header", "aut-hero");
        const identidad = h("div", "aut-identidad");

        if (CONFIG.foto.mostrar) {
            const col = h("div", "aut-hero-foto");
            col.append(crearFoto(nombre, ficha, "aut-foto--hero"));
            const credito = creditoReal(ficha);
            if (credito) col.append(h("p", "aut-foto-credito", credito));

            if (CONFIG.perfil.metadatosBajoFoto) {
                const datos = h("dl", "aut-ficha-metadatos");
                const profesiones = Array.isArray(ficha.profesiones)
                    ? ficha.profesiones.join(" · ")
                    : ficha.profesion;
                const nacionalidad = ficha.nacionalidad;
                const periodo = fechas(ficha).replace(/^n\. /, "");
                const nacionalidadYVida = [nacionalidad, periodo].filter(Boolean).join(" · ");
                [
                    ["Profesión", profesiones],
                    [
                        nacionalidad && periodo ? "Nacionalidad · vida" : nacionalidad ? "Nacionalidad" : "Vida",
                        nacionalidadYVida || periodo
                    ]
                ].filter(([, valor]) => valor).forEach(([etiqueta, valor]) => {
                    const fila = h("div", "aut-ficha-dato");
                    fila.append(h("dt", "aut-ficha-etiqueta", etiqueta));
                    fila.append(h("dd", "aut-ficha-valor", valor));
                    datos.append(fila);
                });
                if (datos.children.length) col.append(datos);
            }

            identidad.append(col);
        }

        const texto = h("div", "aut-hero-texto");
        const contexto = h("div", "aut-hero-contexto");
        contexto.append(
            h("p", "eyebrow", "FICHA DE AUTOR"),
            volver
        );
        texto.append(contexto);
        texto.append(h("h1", "aut-nombre", nombre));

        if (ficha.resumen) texto.append(h("p", "aut-resumen", ficha.resumen));

        if (CONFIG.perfil.ramasEnHero) {
            const ramas = ramasDe(nombre);
            if (ramas.length) {
                const ul = h("ul", "aut-ramas");
                ramas.forEach(r => ul.append(h("li", "aut-rama", r)));
                texto.append(ul);
            }
        }

        /* Acción externa: abre fuentes o, si no existen, Wikipedia */
        const acciones = h("div", "aut-acciones");
        if (propias.length) {
            const archivo = h("a", "aut-btn aut-btn--principal",
                `Ver ${plural(propias.length, "obra", "obras")} en el archivo`);
            archivo.href = `explorar.html?autor=${encodeURIComponent(nombre)}`;
            acciones.append(archivo);
        }
        let capaFuentes = null;
        if (CONFIG.secciones.mas.on) {
            const fuente = accionFuentes(nombre, ficha);
            acciones.append(fuente.elemento);
            capaFuentes = fuente.capa;
        }
        if (acciones.children.length) texto.append(acciones);

        identidad.append(texto);
        hero.append(identidad);

        const obrasCol = h("aside", "aut-hero-obras");
        obrasCol.setAttribute("aria-label", `Obras de ${nombre}`);
        if (CONFIG.secciones.obras.on) {
            const nodo = CONSTRUCTORES.obras(nombre);
            if (nodo) obrasCol.append(nodo);
        }
        if (obrasCol.children.length) hero.append(obrasCol);

        /* Segunda franja: aportes a la izquierda, citas a la derecha */
        const cuerpo = h("div", "aut-cuerpo");
        const principal = h("div", "aut-col aut-col--principal");
        const lateral = h("div", "aut-col aut-col--lateral");

        Object.keys(CONFIG.secciones).forEach(id => {
            const cfg = CONFIG.secciones[id];
            if (id === "obras") return;
            if (!cfg.on || !CONSTRUCTORES[id]) return;
            const nodo = CONSTRUCTORES[id](nombre);
            if (!nodo) return;
            if (id === "mas") nodo.id = "aut-mas";
            (cfg.col === "lateral" ? lateral : principal).append(nodo);
        });

        cuerpo.append(principal);
        if (lateral.children.length) cuerpo.append(lateral);
        else cuerpo.classList.add("sin-lateral");

        /* Anterior / siguiente */
        const idx = nombres.indexOf(nombre);
        const pager = h("nav", "aut-pager");
        pager.setAttribute("aria-label", "Autor anterior y siguiente");
        if (nombres[idx - 1]) {
            const a = h("a", "aut-pager-enlace", `← ${nombres[idx - 1]}`);
            a.href = hrefAutor(nombres[idx - 1]);
            pager.append(a);
        }
        if (nombres[idx + 1]) {
            const a = h("a", "aut-pager-enlace aut-pager-sig", `${nombres[idx + 1]} →`);
            a.href = hrefAutor(nombres[idx + 1]);
            pager.append(a);
        }

        montaje.append(hero, cuerpo);
        if (pager.children.length) montaje.append(pager);
        if (capaFuentes) montaje.append(capaFuentes);
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        const buscado = params.get("a");

        document.body.classList.remove("aut-fuentes-abiertas");
        montaje.innerHTML = "";

        montaje.dataset.vista    = buscado ? "perfil" : "indice";
        montaje.dataset.foto     = CONFIG.foto.mostrar ? "si" : "no";
        montaje.dataset.tamano   = CONFIG.foto.tamano;
        montaje.dataset.layout   = CONFIG.perfil.layout;
        montaje.dataset.fijo     = CONFIG.perfil.lateralFijo ? "si" : "no";

        if (buscado && nombres.includes(buscado)) {
            pintarPerfil(buscado);
        } else if (buscado) {
            const msg = h("div", "aut-error");
            msg.append(
                h("p", "description", "No encontramos a ese autor."),
                (() => { const a = h("a", "aut-btn", "Ver todos los autores"); a.href = "autores.html"; return a; })()
            );
            montaje.append(msg);
            document.title = "Autor no encontrado — Códice";
        } else {
            pintarIndice();
        }
    }


    /* =====================================================
       ============  PANEL DE PRUEBAS (?lab=1)  ============
       Bloque BORRABLE: elimina desde aquí hasta "FIN PANEL"
       y quita la llamada `montarLab()` del arranque.
       Los cambios se guardan solo en tu navegador.
    ===================================================== */

    function montarLab() {

        const caja = document.createElement("details");
        caja.className = "aut-lab";
        caja.open = true;

        const sm = document.createElement("summary");
        sm.textContent = "Panel de pruebas";
        caja.append(sm);

        const cuerpo = h("div", "aut-lab-cuerpo");
        caja.append(cuerpo);

        function ruta(clave) {
            const partes = clave.split(".");
            const ultimo = partes.pop();
            let o = CONFIG;
            partes.forEach(p => { o = o[p]; });
            return { o, ultimo };
        }

        function fila(etiqueta, control) {
            const f = h("label", "aut-lab-fila");
            f.append(h("span", null, etiqueta), control);
            return f;
        }

        function opcion(clave, etiqueta, valores) {
            const sel = document.createElement("select");
            valores.forEach(v => {
                const op = h("option", null, v);
                op.value = v;
                sel.append(op);
            });
            const { o, ultimo } = ruta(clave);
            sel.value = o[ultimo];
            sel.addEventListener("change", () => {
                ruta(clave).o[ultimo] = sel.value;
                guardarLab(); render();
            });
            return fila(etiqueta, sel);
        }

        function bool(clave, etiqueta) {
            const chk = document.createElement("input");
            chk.type = "checkbox";
            const { o, ultimo } = ruta(clave);
            chk.checked = Boolean(o[ultimo]);
            chk.addEventListener("change", () => {
                ruta(clave).o[ultimo] = chk.checked;
                guardarLab(); render();
            });
            return fila(etiqueta, chk);
        }

        cuerpo.append(
            h("p", "aut-lab-grupo", "Retrato"),
            bool("foto.mostrar", "Mostrar foto"),
            opcion("foto.forma", "Forma", ["retrato", "circulo"]),
            opcion("foto.tamano", "Tamaño", ["s", "m", "l"]),

            h("p", "aut-lab-grupo", "Índice"),
            opcion("indice.estilo", "Estilo", ["tarjetas", "filas"]),

            h("p", "aut-lab-grupo", "Perfil"),
            opcion("perfil.layout", "Layout", ["dos-columnas", "una-columna"]),
            opcion("perfil.aportes", "Aportes", ["lista", "acordeon", "tarjetas"]),
            bool("perfil.lateralFijo", "Lateral fijo"),
            bool("perfil.ramasEnHero", "Ramas en cabecera"),
        bool("perfil.metadatosBajoFoto", "Metadatos bajo el retrato"),

            h("p", "aut-lab-grupo", "Secciones")
        );

        Object.keys(CONFIG.secciones).forEach(id => {
            const f = h("div", "aut-lab-fila aut-lab-fila--sec");
            const chk = document.createElement("input");
            chk.type = "checkbox";
            chk.checked = CONFIG.secciones[id].on;
            chk.addEventListener("change", () => {
                CONFIG.secciones[id].on = chk.checked; guardarLab(); render();
            });
            const sel = document.createElement("select");
            ["principal", "lateral"].forEach(v => {
                const op = h("option", null, v); op.value = v; sel.append(op);
            });
            sel.value = CONFIG.secciones[id].col;
            sel.addEventListener("change", () => {
                CONFIG.secciones[id].col = sel.value; guardarLab(); render();
            });
            const et = h("label", null, id);
            f.append(chk, et, sel);
            cuerpo.append(f);
        });

        const botones = h("div", "aut-lab-botones");

        const copiar = h("button", null, "Copiar CONFIG");
        copiar.type = "button";
        copiar.addEventListener("click", () => {
            const txt = "const CONFIG_BASE = " + JSON.stringify(CONFIG, null, 4) + ";";
            const hecho = () => { copiar.textContent = "Copiado ✓"; setTimeout(() => { copiar.textContent = "Copiar CONFIG"; }, 1600); };
            if (navigator.clipboard) navigator.clipboard.writeText(txt).then(hecho, hecho);
            else hecho();
        });

        const reset = h("button", null, "Restablecer");
        reset.type = "button";
        reset.addEventListener("click", () => {
            try { localStorage.removeItem(CLAVE_LAB); } catch (e) { /* nada */ }
            window.location.reload();
        });

        botones.append(copiar, reset);
        cuerpo.append(botones);

        document.body.append(caja);
    }

    /* ===================  FIN PANEL  =================== */


    /* =====================================================
       ARRANQUE
    ===================================================== */

    function cargarJSON(url, respaldo) {
        return fetch(url)
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .catch(() => respaldo);
    }

    montaje.setAttribute("aria-busy", "true");

    Promise.all([
        cargarJSON("data/autores.json", {}),
        cargarJSON("data/biblioteca.json", []),
        cargarJSON("data/citas.json", [])
    ]).then(([f, b, c]) => {

        fichas = f && typeof f === "object" ? f : {};
        obras = Array.isArray(b) ? b : [];
        citasArchivo = Array.isArray(c) ? c : [];

        nombres = [...new Set([
            ...Object.keys(fichas),
            ...obras.map(o => o.autor).filter(Boolean)
        ])].sort((a, b2) => a.localeCompare(b2, "es"));

        if (LAB) { leerLab(); }

        montaje.removeAttribute("aria-busy");
        render();

        if (LAB) { montarLab(); }
    });

})();
