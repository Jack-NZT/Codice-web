document.addEventListener("DOMContentLoaded", iniciarExamenes);

async function iniciarExamenes() {
    const byId = id => document.getElementById(id);
    const controls = {
        career: byId("exam-career"),
        cycle: byId("exam-cycle"),
        course: byId("exam-course"),
        topic: byId("exam-topic"),
        difficulty: byId("exam-difficulty"),
        time: byId("exam-time"),
        configDetails: byId("exam-config-details"),
        advancedDetails: byId("exam-advanced"),
        start: byId("exam-start"),
        active: byId("exam-active"),
        empty: byId("exam-empty"),
        emptyCopy: byId("exam-empty-copy"),
        routeName: byId("exam-route-name"),
        routeLabel: byId("exam-route-label"),
        bankType: byId("exam-bank-type"),
        bankSize: byId("exam-bank-size"),
        bankEmpty: byId("exam-bank-empty"),
        countNote: byId("exam-count-note"),
        countButtons: [...document.querySelectorAll("[data-count]")],
        modeButtons: [...document.querySelectorAll("[data-mode]")],
        workspace: byId("exam-workspace"),
        history: byId("exam-history")
    };
    if (!controls.active || !controls.career) return;

    let carreras = [];
    let cursosPorCarrera = new Map();
    let bancos = new Map();
    let bancosCargados = new Map();
    let bancoActual = null;
    let solicitudDeBanco = 0;
    let cursoActual = null;
    let carreraActual = null;
    let cicloActual = null;
    let cantidadElegida = 10;
    let cantidadPreferida = 10;
    let modalidad = "practice";
    let presentacion = "blocks";
    let bloqueActual = 0;
    let preguntasSesion = [];
    let respuestas = new Map();
    let segundosRestantes = 0;
    let segundosAlInicio = 0;
    let inicioSesion = 0;
    let reloj = null;
    let sesionCerrada = true;

    try {
        const [respuestaCarreras, respuestaBancos] = await Promise.all([
            fetch("data/silabos/carreras.json"),
            fetch("data/examenes/bancos.json")
        ]);
        if (!respuestaCarreras.ok || !respuestaBancos.ok) throw new Error("No se pudo cargar el índice académico.");
        carreras = await respuestaCarreras.json();
        const registrosBancos = await respuestaBancos.json();

        const resultadosCursos = await Promise.all(carreras.map(async carrera => {
            try {
                const respuesta = await fetch(carrera.archivo);
                if (!respuesta.ok) throw new Error("Sílabos no disponibles");
                return [carrera.id, await respuesta.json()];
            } catch (error) {
                console.warn("No se pudieron cargar los cursos de " + carrera.nombre, error);
                return [carrera.id, []];
            }
        }));
        cursosPorCarrera = new Map(resultadosCursos);

        await Promise.all(registrosBancos.map(async registro => {
            const llave = claveCurso(registro.carrera, registro.ciclo, registro.cursoId);
            try {
                const respuesta = await fetch(registro.archivo);
                if (!respuesta.ok) throw new Error("Índice del banco no disponible");
                const banco = await respuesta.json();
                bancos.set(llave, {
                    ...banco,
                    archivoIndice: registro.archivo,
                    demostracion: Boolean(registro.demostracion || banco.demostracion)
                });
            } catch (error) {
                console.warn("No se pudo cargar el banco " + registro.archivo, error);
            }
        }));

        poblarCarreras();
        controls.career.addEventListener("change", () => actualizarCiclos());
        controls.cycle.addEventListener("change", () => actualizarCursos());
        controls.course.addEventListener("change", seleccionarCurso);
        controls.topic.addEventListener("change", actualizarDisponibilidad);
        controls.difficulty.addEventListener("change", actualizarDisponibilidad);
        controls.time.addEventListener("change", actualizarBotonInicio);
        controls.countButtons.forEach(boton => boton.addEventListener("click", () => {
            cantidadElegida = Number(boton.dataset.count);
            cantidadPreferida = cantidadElegida;
            actualizarDisponibilidad();
        }));
        controls.modeButtons.forEach(boton => boton.addEventListener("click", () => {
            modalidad = boton.dataset.mode;
            controls.modeButtons.forEach(opcion => opcion.setAttribute("aria-pressed", String(opcion === boton)));
            actualizarBotonInicio();
        }));
        controls.active.addEventListener("change", manejarCambioRespuesta);
        controls.active.addEventListener("click", manejarAccionSesion);
        controls.start.addEventListener("click", iniciarSesion);

        actualizarCiclos("derecho", 1, "introduccion-al-derecho");
        actualizarHistorial();
    } catch (error) {
        console.error("No se pudo inicializar la sección de exámenes:", error);
        controls.routeName.textContent = "No fue posible cargar la estructura académica.";
        controls.bankType.textContent = "Datos no disponibles";
        controls.bankSize.textContent = "Revisa la conexión e inténtalo de nuevo.";
        controls.start.disabled = true;
        controls.emptyCopy.textContent = "No se pudo cargar la información necesaria. Recarga la página para volver a intentarlo.";
    }

    function claveCurso(carrera, ciclo, cursoId) {
        return [String(carrera), String(ciclo), String(cursoId)].join("|");
    }

    function normalizarCiclo(curso) {
        return Number(curso.cicloNumero || curso.cicloNumero === 0
            ? curso.cicloNumero
            : String(curso.ciclo || "").match(/\d+/)?.[0] || 0);
    }

    function poblarCarreras() {
        controls.career.replaceChildren();
        carreras.forEach(carrera => {
            const opcion = document.createElement("option");
            opcion.value = carrera.id;
            opcion.textContent = carrera.nombre + (carrera.demo ? " · versión de muestra" : "");
            controls.career.append(opcion);
        });
        controls.career.disabled = carreras.length < 2;
    }

    function actualizarCiclos(carreraPreferida, cicloPreferido, cursoPreferido) {
        const carreraId = carreraPreferida || controls.career.value || carreras[0]?.id;
        carreraActual = carreras.find(carrera => carrera.id === carreraId) || carreras[0];
        if (!carreraActual) return;
        controls.career.value = carreraActual.id;

        const cursos = cursosPorCarrera.get(carreraActual.id) || [];
        const ciclos = [...new Map(cursos.map(curso => [normalizarCiclo(curso), curso.ciclo || (normalizarCiclo(curso) + " ciclo")])).entries()]
            .sort((a, b) => a[0] - b[0]);
        controls.cycle.replaceChildren();
        ciclos.forEach(([numero, nombre]) => {
            const opcion = document.createElement("option");
            opcion.value = String(numero);
            opcion.textContent = nombre;
            controls.cycle.append(opcion);
        });
        controls.cycle.disabled = ciclos.length < 2;
        if (!ciclos.length) {
            controls.cycle.add(new Option("Sin ciclos disponibles", ""));
            controls.cycle.disabled = true;
            actualizarCursos();
            return;
        }
        const cicloObjetivo = ciclos.some(([numero]) => numero === Number(cicloPreferido))
            ? Number(cicloPreferido)
            : ciclos[0][0];
        controls.cycle.value = String(cicloObjetivo);
        actualizarCursos(cursoPreferido);
    }

    function actualizarCursos(cursoPreferido) {
        cicloActual = Number(controls.cycle.value);
        const cursos = (cursosPorCarrera.get(carreraActual?.id) || [])
            .filter(curso => normalizarCiclo(curso) === cicloActual);
        controls.course.replaceChildren();
        cursos.forEach(curso => {
            const banco = bancos.get(claveCurso(carreraActual.id, cicloActual, curso.id));
            const opcion = document.createElement("option");
            opcion.value = curso.id;
            opcion.textContent = curso.curso + (banco ? " · banco disponible" : " · próximamente");
            controls.course.append(opcion);
        });
        controls.course.disabled = cursos.length < 2;
        if (!cursos.length) {
            controls.course.add(new Option("Sin cursos disponibles", ""));
            controls.course.disabled = true;
            cursoActual = null;
            seleccionarCurso();
            return;
        }
        const cursoConBanco = cursos.find(curso => bancos.has(claveCurso(carreraActual.id, cicloActual, curso.id)));
        const objetivo = cursos.some(curso => curso.id === cursoPreferido)
            ? cursoPreferido
            : (cursoConBanco || cursos[0]).id;
        controls.course.value = objetivo;
        seleccionarCurso();
    }

    async function seleccionarCurso() {
        const solicitudActual = ++solicitudDeBanco;
        const cursoId = controls.course.value;
        cursoActual = (cursosPorCarrera.get(carreraActual?.id) || []).find(curso =>
            curso.id === cursoId && normalizarCiclo(curso) === cicloActual
        ) || null;
        const llave = cursoActual ? claveCurso(carreraActual.id, cicloActual, cursoActual.id) : "";
        const indiceBanco = cursoActual ? bancos.get(llave) || null : null;
        bancoActual = bancosCargados.get(llave) || null;

        if (reloj) clearInterval(reloj);
        controls.active.hidden = true;
        controls.active.replaceChildren();
        controls.empty.hidden = false;
        sesionCerrada = true;

        const partesRuta = [carreraActual?.nombre, cursoActual?.ciclo, cursoActual?.curso].filter(Boolean);
        controls.routeName.textContent = partesRuta.join("  →  ") || "No hay una ruta académica disponible.";
        controls.routeLabel.textContent = carreraActual?.demo ? "RUTA DE MUESTRA" : "RUTA ACTUAL";

        controls.topic.replaceChildren(new Option("Todos los temas", ""));
        controls.difficulty.value = "intermedio";
        controls.topic.disabled = true;
        controls.difficulty.disabled = true;
        if (indiceBanco && bancoActual) {
            mostrarBanco(bancoActual);
        } else if (indiceBanco) {
            controls.bankType.textContent = "Cargando banco";
            controls.bankSize.textContent = "Leyendo preguntas del curso…";
            controls.bankEmpty.hidden = true;
            controls.emptyCopy.textContent = "Cargando los temas y las preguntas de esta ruta…";
            controls.countButtons.forEach(boton => {
                boton.disabled = true;
                boton.setAttribute("aria-pressed", String(Number(boton.dataset.count) === cantidadPreferida));
            });
            controls.countNote.textContent = "Cargando banco…";
            controls.start.disabled = true;
            controls.history.innerHTML = "<span>Tu progreso</span><strong>Cargando banco</strong><small>No requiere cuenta ni se sincroniza.</small>";
            try {
                bancoActual = await cargarBanco(indiceBanco);
                if (solicitudActual !== solicitudDeBanco) return;
                bancosCargados.set(llave, bancoActual);
                mostrarBanco(bancoActual);
            } catch (error) {
                if (solicitudActual !== solicitudDeBanco) return;
                console.error("No se pudieron cargar las preguntas de " + cursoActual.curso, error);
                bancoActual = null;
                controls.bankType.textContent = "Banco no disponible";
                controls.bankSize.textContent = "No se pudieron leer las preguntas.";
                controls.bankEmpty.hidden = true;
                controls.emptyCopy.textContent = "No se pudo cargar el banco de este curso. Comprueba la conexión e inténtalo de nuevo.";
                actualizarDisponibilidad();
                actualizarHistorial();
            }
        } else {
            controls.bankType.textContent = cursoActual ? "Sin banco todavía" : "Ruta no disponible";
            controls.bankEmpty.hidden = !cursoActual;
            controls.emptyCopy.textContent = cursoActual
                ? "Este curso aún no tiene preguntas. Elige otro curso con banco disponible para probar la plataforma."
                : "No se encontraron cursos para esta combinación de carrera y ciclo.";
        }
        actualizarDisponibilidad();
        actualizarHistorial();
    }

    async function cargarBanco(indiceBanco) {
        const banco = { ...indiceBanco };
        if (!Array.isArray(banco.preguntas) && Array.isArray(banco.temas)) {
            const carpetaIndice = banco.archivoIndice.slice(0, banco.archivoIndice.lastIndexOf("/") + 1);
            const temas = await Promise.all(banco.temas.map(async tema => {
                const respuestaTema = await fetch(carpetaIndice + tema.archivo);
                if (!respuestaTema.ok) throw new Error("Tema no disponible: " + tema.nombre);
                return respuestaTema.json();
            }));
            banco.preguntas = temas.flatMap(tema =>
                (tema.preguntas || []).map(pregunta => ({
                    ...pregunta,
                    tema: pregunta.tema || tema.tema,
                    fuente: pregunta.fuente || banco.fuentePredeterminada
                }))
            );
        }
        if (!Array.isArray(banco.preguntas)) banco.preguntas = [];
        return banco;
    }

    function mostrarBanco(banco) {
        bancoActual = banco;
        const opcionCurso = controls.course.selectedOptions[0];
        if (opcionCurso) {
            opcionCurso.textContent = cursoActual.curso + " · " + bancoActual.preguntas.length +
                (bancoActual.preguntas.length === 1 ? " pregunta" : " preguntas");
        }
        controls.topic.replaceChildren(new Option("Todos los temas", ""));
        const temas = [...new Set(bancoActual.preguntas.map(pregunta => pregunta.tema))]
            .sort((a, b) => a.localeCompare(b, "es"));
        temas.forEach(tema => controls.topic.add(new Option(tema, tema)));
        controls.topic.disabled = temas.length === 0;
        controls.difficulty.disabled = bancoActual.preguntas.length === 0;
        controls.bankType.textContent = bancoActual.demostracion ? "Banco de demostración" : "Banco del curso";
        controls.bankEmpty.hidden = true;
        controls.emptyCopy.textContent = "Configura tu recorrido y comienza cuando estés preparado.";
        actualizarDisponibilidad();
        actualizarHistorial();
    }

    function preguntasFiltradas() {
        if (!bancoActual) return [];
        const tema = controls.topic.value;
        const dificultad = controls.difficulty.value;
        return bancoActual.preguntas.filter(pregunta =>
            (!tema || pregunta.tema === tema) &&
            (!dificultad || pregunta.dificultad === dificultad)
        );
    }

    function preguntaApta(pregunta) {
        if (!pregunta || !pregunta.id || !pregunta.enunciado || !pregunta.explicacion) return false;
        if (Array.isArray(pregunta.respuestasCorrectas)) {
            const correctas = pregunta.respuestasCorrectas;
            const distractores = pregunta.distractores;
            const ninguna = pregunta.opcionNinguna;
            if (correctas.length !== 2 || !Array.isArray(distractores) || distractores.length !== 4 || !ninguna) return false;
            const opciones = [...correctas, ...distractores, ninguna];
            const ids = opciones.map(opcion => opcion && opcion.id);
            return opciones.every(opcion => opcion && opcion.id && opcion.texto) &&
                new Set(ids).size === 7 &&
                ninguna.texto === "Ninguna de las anteriores";
        }
        if (!Array.isArray(pregunta.opciones) || pregunta.opciones.length !== 5 || !pregunta.respuestaCorrecta) return false;
        const ids = pregunta.opciones.map(opcion => opcion && opcion.id);
        return pregunta.opciones.every(opcion => opcion && opcion.id && opcion.texto) &&
            new Set(ids).size === 5 &&
            ids.includes(pregunta.respuestaCorrecta);
    }

    function preguntasDisponibles() {
        const vistas = new Set();
        return preguntasFiltradas().filter(pregunta => {
            if (!preguntaApta(pregunta) || vistas.has(pregunta.id)) return false;
            vistas.add(pregunta.id);
            return true;
        });
    }

    function actualizarDisponibilidad() {
        const filtradas = preguntasFiltradas();
        const disponibles = preguntasDisponibles().length;
        const noAptas = filtradas.length - disponibles;
        controls.bankSize.textContent = disponibles +
            (disponibles === 1 ? " pregunta disponible" : " preguntas disponibles") +
            (noAptas ? " · " + noAptas + " no aptas" : "");
        const solicitadas = cantidadPreferida;
        cantidadElegida = disponibles ? Math.min(solicitadas, disponibles) : solicitadas;
        controls.countButtons.forEach(boton => {
            const cantidad = Number(boton.dataset.count);
            boton.disabled = disponibles === 0 || (cantidad > disponibles && cantidad !== 5);
            boton.setAttribute("aria-pressed", String(cantidad === solicitadas));
        });
        const notaCantidad = disponibles && solicitadas > disponibles
            ? "Solicitaste " + solicitadas + "; el filtro tiene " + disponibles +
                ". Se utilizarán las " + disponibles + " disponibles."
            : disponibles
                ? "Se utilizarán " + cantidadElegida + (cantidadElegida === 1 ? " pregunta." : " preguntas.")
                : "No hay preguntas con esta combinación de filtros.";
        controls.countNote.textContent = noAptas
            ? notaCantidad + " Se excluyeron " + noAptas + (noAptas === 1 ? " pregunta no apta." : " preguntas no aptas.")
            : notaCantidad;
        actualizarBotonInicio();
    }

    function actualizarBotonInicio() {
        const disponibles = preguntasDisponibles().length;
        const cantidad = Math.min(cantidadPreferida, disponibles);
        const modoTexto = modalidad === "exam" ? "simulacro" : "práctica";
        controls.start.disabled = !disponibles;
        controls.start.innerHTML = disponibles
            ? "Iniciar " + modoTexto + " · " + cantidad + " <span aria-hidden=\"true\">→</span>"
            : "Sin preguntas disponibles";
    }

    function bloquearConfiguracion(bloquear) {
        controls.start.disabled = bloquear || preguntasDisponibles().length === 0;
        controls.career.disabled = bloquear || carreras.length < 2;
        controls.cycle.disabled = bloquear || controls.cycle.options.length < 2;
        controls.course.disabled = bloquear || controls.course.options.length < 2;
        controls.topic.disabled = bloquear || !bancoActual;
        controls.difficulty.disabled = bloquear || !bancoActual;
        controls.time.disabled = bloquear;
        controls.countButtons.forEach(boton => {
            const disponibles = preguntasDisponibles().length;
            boton.disabled = bloquear || disponibles === 0 ||
                (Number(boton.dataset.count) > disponibles && Number(boton.dataset.count) !== 5);
        });
        controls.modeButtons.forEach(boton => boton.disabled = bloquear);
    }

    function mezclar(lista) {
        const copia = [...lista];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }

    function prepararPreguntaSesion(pregunta) {
        /* Compatibilidad con los bancos actuales de cinco opciones fijas. */
        if (!Array.isArray(pregunta.respuestasCorrectas)) {
            return {
                ...pregunta,
                opcionesMezcladas: mezclar(pregunta.opciones),
                respuestaCorrectaSesion: pregunta.respuestaCorrecta
            };
        }

        const correctas = pregunta.respuestasCorrectas;
        const distractores = pregunta.distractores || [];
        const ninguna = pregunta.opcionNinguna;
        if (correctas.length !== 2 || distractores.length !== 4 || !ninguna) {
            throw new Error("Pregunta de selección aleatoria incompleta: " + pregunta.id);
        }

        const escenario = Math.floor(Math.random() * 3);
        const opciones = escenario === 2
            ? [...distractores, ninguna]
            : [correctas[escenario], ...mezclar(distractores).slice(0, 3), ninguna];

        return {
            ...pregunta,
            opcionesMezcladas: mezclar(opciones),
            respuestaCorrectaSesion: escenario === 2 ? ninguna.id : correctas[escenario].id,
            escenarioAleatorio: escenario
        };
    }

    function iniciarSesion() {
        const elegibles = mezclar(preguntasDisponibles());
        const disponibles = elegibles.slice(0, Math.min(cantidadPreferida, elegibles.length));
        if (!disponibles.length) return;
        try {
            preguntasSesion = disponibles.map(prepararPreguntaSesion);
        } catch (error) {
            console.error("No se pudo generar el examen:", error);
            controls.countNote.textContent = "Una pregunta del banco no cumple el formato y no se pudo iniciar el examen.";
            return;
        }

        respuestas = new Map(preguntasSesion.map(pregunta => [pregunta.id, null]));
        presentacion = "blocks";
        bloqueActual = 0;
        sesionCerrada = false;
        segundosAlInicio = Number(controls.time.value || 0) * 60;
        segundosRestantes = segundosAlInicio;
        inicioSesion = Date.now();
        controls.empty.hidden = true;
        controls.active.hidden = false;
        controls.workspace.classList.add("has-session");
        if (window.matchMedia("(max-width: 900px)").matches) controls.configDetails.open = false;
        bloquearConfiguracion(true);
        dibujarSesion();
        if (segundosAlInicio > 0) iniciarReloj();
    }

    function iniciarReloj() {
        if (reloj) clearInterval(reloj);
        reloj = setInterval(() => {
            segundosRestantes = Math.max(0, segundosAlInicio - Math.floor((Date.now() - inicioSesion) / 1000));
            const relojTexto = controls.active.querySelector("#exam-clock");
            if (relojTexto) relojTexto.textContent = formatearTiempo(segundosRestantes);
            if (segundosRestantes <= 0) {
                clearInterval(reloj);
                reloj = null;
                mostrarResultado(true);
            }
        }, 250);
    }

    function formatearTiempo(segundos) {
        const minutos = Math.floor(Math.max(0, segundos) / 60);
        const resto = Math.max(0, segundos) % 60;
        return String(minutos).padStart(2, "0") + ":" + String(resto).padStart(2, "0");
    }

    function preguntasVisibles() {
        if (presentacion === "all") return preguntasSesion.map((pregunta, indice) => ({ pregunta, indice }));
        const primero = bloqueActual * 5;
        return preguntasSesion.slice(primero, primero + 5).map((pregunta, desplazamiento) => ({
            pregunta,
            indice: primero + desplazamiento
        }));
    }

    function dibujarSesion() {
        if (sesionCerrada || !preguntasSesion.length) return;
        const total = preguntasSesion.length;
        const respondidas = [...respuestas.values()].filter(respuesta => respuesta !== null).length;
        const bloques = Math.ceil(total / 5);
        const primero = presentacion === "all" ? 1 : bloqueActual * 5 + 1;
        const ultimo = presentacion === "all" ? total : Math.min((bloqueActual + 1) * 5, total);
        const modo = modalidad === "exam" ? "Simulacro" : "Práctica";
        const temporizador = segundosAlInicio > 0
            ? "<div class=\"exam-timer\" role=\"timer\" aria-label=\"Tiempo restante\"><small>TIEMPO RESTANTE</small><strong id=\"exam-clock\">" +
                formatearTiempo(segundosRestantes) + "</strong></div>"
            : "";
        const tarjetas = preguntasVisibles().map(({ pregunta, indice }) => dibujarTarjeta(pregunta, indice)).join("");
        const navegacion = presentacion === "blocks"
            ? "<nav class=\"exam-block-nav\" aria-label=\"Navegación por bloques\">" +
                "<button type=\"button\" class=\"exam-secondary\" data-block=\"previous\"" + (bloqueActual === 0 ? " disabled" : "") + ">← Anterior</button>" +
                "<span data-block-label>Bloque " + (bloqueActual + 1) + " de " + bloques + " · Preguntas " + primero + "–" + ultimo + " de " + total + "</span>" +
                "<button type=\"button\" class=\"exam-secondary\" data-block=\"next\"" + (bloqueActual >= bloques - 1 ? " disabled" : "") + ">Siguiente →</button>" +
                "</nav>"
            : "<p class=\"exam-all-note\">Vista completa · Preguntas 1–" + total + " de " + total + "</p>";
        const accionFinal = modalidad === "exam" ? "Entregar simulacro" : "Finalizar práctica";

        controls.active.innerHTML =
            "<header class=\"exam-session-head\"><div>" +
            "<p class=\"eyebrow\">" + escapar(bancoActual.curso) + " · " + modo + "</p>" +
            "<h2>" + escapar(presentacion === "all" ? "Todas las preguntas" : "Tu examen") + "</h2>" +
            "<p class=\"exam-progress-label\" data-progress-label>" + respondidas + " de " + total + " preguntas respondidas</p>" +
            "</div><div class=\"exam-session-head-actions\">" + temporizador +
            "<div class=\"exam-view-toggle\" role=\"group\" aria-label=\"Presentación de las preguntas\">" +
            "<button type=\"button\" data-view=\"blocks\" aria-pressed=\"" + String(presentacion === "blocks") + "\">Bloques de 5</button>" +
            "<button type=\"button\" data-view=\"all\" aria-pressed=\"" + String(presentacion === "all") + "\">Todas</button></div>" +
            "<button type=\"button\" class=\"exam-exit\" data-exit>Salir</button></div></header>" +
            "<div class=\"exam-progress\" role=\"progressbar\" aria-label=\"Progreso del examen\" aria-valuemin=\"0\" aria-valuemax=\"" + total +
            "\" aria-valuenow=\"" + respondidas + "\"><span style=\"width:" + Math.round(respondidas / total * 100) + "%\"></span></div>" +
            "<div class=\"exam-question-list\">" + tarjetas + "</div>" +
            "<div class=\"exam-session-footer\">" + navegacion +
            "<button type=\"button\" class=\"exam-submit\" data-submit>" + accionFinal + " <span aria-hidden=\"true\">→</span></button></div>" +
            (segundosAlInicio > 0 ? "<p class=\"exam-session-time-note\">El tiempo sigue corriendo al cambiar de bloque o presentación.</p>" : "");
        controls.active.querySelectorAll(".exam-option input:checked").forEach(input =>
            input.closest(".exam-option")?.classList.add("is-selected")
        );
    }

    function dibujarTarjeta(pregunta, indice) {
        const respuesta = respuestas.get(pregunta.id);
        const respondida = respuesta !== null && respuesta !== undefined;
        const correcta = respondida && respuesta === pregunta.respuestaCorrectaSesion;
        const bloqueada = modalidad === "practice" && respondida;
        const estado = bloqueada
            ? "<div class=\"exam-feedback " + (correcta ? "is-correct" : "is-incorrect") +
                "\"><strong>" + (correcta ? "Respuesta correcta" : "Revisa esta idea") + "</strong><p>" +
                escapar(pregunta.explicacion) + "</p>" + renderizarFuente(pregunta.fuente) + "</div>"
            : "";
        const opciones = pregunta.opcionesMezcladas.map((opcion, i) => {
            const esCorrecta = bloqueada && opcion.id === pregunta.respuestaCorrectaSesion;
            const esIncorrecta = bloqueada && opcion.id === respuesta && !correcta;
            return "<label class=\"exam-option" + (esCorrecta ? " is-correct" : esIncorrecta ? " is-incorrect" : "") + "\">" +
                "<input type=\"radio\" name=\"respuesta-" + escapar(pregunta.id) + "\" value=\"" + escapar(opcion.id) + "\"" +
                (respuesta === opcion.id ? " checked" : "") + (bloqueada ? " disabled" : "") + ">" +
                "<span class=\"exam-option-letter\">" + String.fromCharCode(65 + i) + "</span><span>" + escapar(opcion.texto) +
                "</span><span class=\"exam-option-mark\" aria-hidden=\"true\"></span></label>";
        }).join("");
        return "<article class=\"exam-question-card" + (respondida ? " is-answered" : "") + "\" data-question-card data-question-id=\"" +
            escapar(pregunta.id) + "\"><div class=\"exam-question-card-head\"><span class=\"exam-question-number\">Pregunta " +
            String(indice + 1).padStart(2, "0") + "</span><span class=\"exam-question-topic\">" +
            escapar(pregunta.tema || "Introducción al Derecho") + " · " + escapar(etiquetaDificultad(pregunta.dificultad)) +
            "</span></div><fieldset class=\"exam-question\"><legend>" + escapar(pregunta.enunciado) +
            "</legend><div class=\"exam-options\">" + opciones + "</div></fieldset><div class=\"exam-answer-area\">" + estado + "</div></article>";
    }

    function manejarCambioRespuesta(evento) {
        const input = evento.target.closest(".exam-option input[type=\"radio\"]");
        if (!input || sesionCerrada) return;
        const tarjeta = input.closest("[data-question-card]");
        const idPregunta = tarjeta?.dataset.questionId;
        const pregunta = preguntasSesion.find(item => item.id === idPregunta);
        if (!pregunta || !tarjeta) return;
        if (modalidad === "practice" && respuestas.get(idPregunta) !== null) return;

        respuestas.set(idPregunta, input.value);
        tarjeta.classList.add("is-answered");
        tarjeta.querySelectorAll(".exam-option").forEach(opcion => opcion.classList.remove("is-selected"));
        input.closest(".exam-option")?.classList.add("is-selected");
        if (modalidad === "practice") {
            const correcta = input.value === pregunta.respuestaCorrectaSesion;
            tarjeta.querySelectorAll("input").forEach(opcion => {
                opcion.disabled = true;
                const etiqueta = opcion.closest(".exam-option");
                if (opcion.value === pregunta.respuestaCorrectaSesion) etiqueta.classList.add("is-correct");
                if (opcion.value === input.value && !correcta) etiqueta.classList.add("is-incorrect");
            });
            tarjeta.querySelector(".exam-answer-area").innerHTML =
                "<div class=\"exam-feedback " + (correcta ? "is-correct" : "is-incorrect") + "\"><strong>" +
                (correcta ? "Respuesta correcta" : "Revisa esta idea") + "</strong><p>" +
                escapar(pregunta.explicacion) + "</p>" + renderizarFuente(pregunta.fuente) + "</div>";
        }
        actualizarProgreso();
    }

    function actualizarProgreso() {
        const total = preguntasSesion.length;
        const respondidas = [...respuestas.values()].filter(respuesta => respuesta !== null).length;
        const barra = controls.active.querySelector(".exam-progress");
        const etiqueta = controls.active.querySelector("[data-progress-label]");
        if (barra) {
            barra.setAttribute("aria-valuenow", String(respondidas));
            barra.querySelector("span").style.width = Math.round(respondidas / total * 100) + "%";
        }
        if (etiqueta) etiqueta.textContent = respondidas + " de " + total + " preguntas respondidas";
    }

    function manejarAccionSesion(evento) {
        const boton = evento.target.closest("button");
        if (!boton) return;
        if (boton.dataset.view) {
            presentacion = boton.dataset.view;
            const desplazamiento = window.scrollY;
            dibujarSesion();
            window.scrollTo(0, desplazamiento);
        } else if (boton.dataset.block === "previous" && bloqueActual > 0) {
            bloqueActual -= 1;
            dibujarSesion();
        } else if (boton.dataset.block === "next" && bloqueActual < Math.ceil(preguntasSesion.length / 5) - 1) {
            bloqueActual += 1;
            dibujarSesion();
        } else if (boton.hasAttribute("data-submit")) {
            entregarSesion();
        } else if (boton.hasAttribute("data-exit")) {
            abandonarSesion();
        } else if (boton.hasAttribute("data-again")) {
            iniciarSesion();
        } else if (boton.hasAttribute("data-home")) {
            abandonarSesion();
        }
    }

    function entregarSesion() {
        const pendientes = [...respuestas.values()].filter(respuesta => respuesta === null).length;
        const respondidas = preguntasSesion.length - pendientes;
        const mensaje = modalidad === "exam" ? "Entregar simulacro" : "Finalizar práctica";
        if (!window.confirm(mensaje + ": " + respondidas + " respondidas y " + pendientes + " pendientes. ¿Continuar?")) return;
        mostrarResultado(false);
    }

    function mostrarResultado(tiempoAgotado) {
        if (sesionCerrada) return;
        sesionCerrada = true;
        if (reloj) clearInterval(reloj);
        reloj = null;
        segundosRestantes = segundosAlInicio > 0
            ? Math.max(0, segundosAlInicio - Math.floor((Date.now() - inicioSesion) / 1000))
            : 0;
        bloquearConfiguracion(false);

        const resultados = preguntasSesion.map(pregunta => {
            const respuesta = respuestas.get(pregunta.id);
            return {
                pregunta,
                seleccion: respuesta,
                correcta: respuesta !== null && respuesta === pregunta.respuestaCorrectaSesion,
                sinResponder: respuesta === null
            };
        });
        const aciertos = resultados.filter(resultado => resultado.correcta).length;
        const sinResponder = resultados.filter(resultado => resultado.sinResponder).length;
        const incorrectas = resultados.length - aciertos - sinResponder;
        const porcentaje = Math.round(aciertos / Math.max(1, resultados.length) * 100);
        const segundosEmpleados = segundosAlInicio > 0
            ? Math.min(segundosAlInicio, Math.floor((Date.now() - inicioSesion) / 1000))
            : null;
        const intento = {
            fecha: new Date().toISOString(),
            aciertos,
            total: resultados.length,
            porcentaje,
            segundosEmpleados,
            curso: bancoActual.curso,
            cursoId: bancoActual.cursoId,
            carrera: carreraActual.nombre,
            carreraId: carreraActual.id,
            ciclo: cicloActual,
            modalidad
        };
        guardarIntento(intento);
        actualizarHistorial();

        controls.active.innerHTML =
            "<section class=\"exam-result\"><p class=\"eyebrow\">" +
            (tiempoAgotado ? "TIEMPO AGOTADO · RESULTADOS" : modalidad === "exam" ? "SIMULACRO COMPLETADO" : "PRÁCTICA COMPLETADA") +
            "</p><h2 tabindex=\"-1\">Resultado del examen</h2><div class=\"exam-score-summary\"><strong>" + porcentaje +
            "%</strong><span>" + aciertos + " correctas · " + incorrectas + " incorrectas · " + sinResponder + " sin responder</span>" +
            (segundosEmpleados !== null ? "<span>Tiempo empleado · " + formatearTiempo(segundosEmpleados) + "</span>" : "") +
            "</div><details class=\"exam-review\"><summary>Revisar las " + resultados.length + " preguntas</summary><div>" +
            resultados.map(crearRevision).join("") + "</div></details><div class=\"exam-result-actions\">" +
            "<button type=\"button\" class=\"exam-start\" data-again>Nuevo intento <span aria-hidden=\"true\">↻</span></button>" +
            "<button type=\"button\" class=\"exam-secondary\" data-home>Volver a la configuración</button></div></section>";
        controls.active.querySelector(".exam-result h2").focus({ preventScroll: true });
        if (window.matchMedia("(max-width: 900px)").matches) controls.configDetails.open = true;
    }

    function crearRevision(resultado) {
        const pregunta = resultado.pregunta;
        const textoElegido = resultado.sinResponder
            ? "Sin responder"
            : pregunta.opcionesMezcladas.find(opcion => opcion.id === resultado.seleccion)?.texto || "";
        const correcta = pregunta.opcionesMezcladas.find(opcion => opcion.id === pregunta.respuestaCorrectaSesion)?.texto || "";
        const claseEstado = resultado.correcta ? "is-correct" : resultado.sinResponder ? "is-unanswered" : "is-incorrect";
        const estado = resultado.sinResponder ? "Sin responder" : resultado.correcta ? "Correcta" : "Incorrecta";
        return "<article class=\"exam-review-item\"><div class=\"exam-review-item-head\"><p class=\"eyebrow\">" +
            escapar(pregunta.tema || "Introducción al Derecho") + "</p><span class=\"exam-review-status " + claseEstado +
            "\">" + estado + "</span></div><h3>" + escapar(pregunta.enunciado) + "</h3><p><b>" +
            (resultado.sinResponder ? "Estado: " : "Tu respuesta: ") + "</b>" + escapar(textoElegido) + "</p>" +
            (!resultado.correcta ? "<p><b>Respuesta correcta:</b> " + escapar(correcta) + "</p>" : "") +
            "<p>" + escapar(pregunta.explicacion) + "</p>" + renderizarFuente(pregunta.fuente) + "</article>";
    }

    function guardarIntento(intento) {
        try {
            const clave = "codice-examenes-intentos-v2";
            const historial = JSON.parse(localStorage.getItem(clave) || "[]");
            historial.push(intento);
            localStorage.setItem(clave, JSON.stringify(historial.slice(-100)));
        } catch (error) {
            console.warn("No fue posible guardar el progreso en este dispositivo.", error);
        }
    }

    function actualizarHistorial() {
        if (!controls.history) return;
        if (!bancoActual || !carreraActual) {
            controls.history.innerHTML = "<span>Tu progreso</span><strong>Sin banco para este curso</strong><small>No requiere cuenta ni se sincroniza.</small>";
            return;
        }
        try {
            const guardados = JSON.parse(localStorage.getItem("codice-examenes-intentos-v2") || "[]");
            const historial = guardados.filter(intento =>
                intento.carreraId === carreraActual.id && intento.cursoId === bancoActual.cursoId
            );
            const total = historial.length;
            const mejor = total
                ? historial.reduce((mejorActual, intento) =>
                    Number(intento.porcentaje) > Number(mejorActual.porcentaje) ? intento : mejorActual
                )
                : null;
            controls.history.innerHTML = total
                ? "<span>Tu progreso</span><strong>" + total + (total === 1 ? " intento" : " intentos") +
                    "</strong><small>Mejor: " + mejor.porcentaje + "% · " + mejor.total + " preguntas</small>"
                : "<span>Tu progreso</span><strong>Aún sin intentos para este curso</strong><small>No requiere cuenta ni se sincroniza.</small>";
        } catch (error) {
            controls.history.textContent = "El historial no está disponible en este navegador.";
        }
    }

    function abandonarSesion() {
        const yaRespondio = [...respuestas.values()].some(respuesta => respuesta !== null);
        if (!sesionCerrada && yaRespondio && !window.confirm("¿Salir de esta sesión? El avance actual no se guardará.")) return;
        if (reloj) clearInterval(reloj);
        reloj = null;
        sesionCerrada = true;
        controls.active.hidden = true;
        controls.active.replaceChildren();
        controls.empty.hidden = false;
        controls.workspace.classList.remove("has-session");
        controls.configDetails.open = true;
        bloquearConfiguracion(false);
        controls.start.focus({ preventScroll: true });
    }

    function etiquetaDificultad(dificultad) {
        return dificultad === "basico" ? "Nivel inicial"
            : dificultad === "avanzado" ? "Nivel avanzado"
                : "Nivel intermedio";
    }

    function renderizarFuente(fuente) {
        if (!fuente?.referencia) return "";
        let enlace = "";
        try {
            const url = new URL(fuente.url);
            if (url.protocol === "http:" || url.protocol === "https:") {
                enlace = " <a href=\"" + escapar(url.href) + "\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir fuente ↗</a>";
            }
        } catch (error) { /* Se conserva la referencia aunque no haya URL. */ }
        return "<small class=\"exam-source\">" + escapar(fuente.referencia) + enlace + "</small>";
    }

    function escapar(valor) {
        return String(valor).replace(/[&<>\"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[caracter]);
    }
}
