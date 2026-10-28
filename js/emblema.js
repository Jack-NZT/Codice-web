/* =========================================================
   CÓDICE — Emblema B (balanza-lomo): animación de montaje
   SOLO para index.html. Va en js/emblema.js y se carga justo
   después de </header>. El resto de páginas llevan el emblema
   estático escrito en su propio HTML y no cargan este archivo.
========================================================= */
(function () {
    "use strict";

    var logo = null;

    /* ---------- Ajustes ---------- */
    var MODO_PRUEBA = true; // true = se anima en CADA carga (ignora "una vez" y
                            // "reducir movimiento"). Pon false al terminar de probar.
    var VELOCIDAD = 1;     // 1 = normal · 0.5 = el doble de lento
    var AMPLITUD = 12;     // grados de inclinación inicial (0 = sin pesaje)
    var CLAVE = "codice-emblema";

    /* ---------- ¿Se anima en esta carga? ---------- */
    var forzar = /[?&]emblema=forzar/.test(location.search);
    var reducir = window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;

    function decidir() {
        var r;
        if (forzar || MODO_PRUEBA) r = [true, "modo prueba"];
        else if (reducir) r = [false, "movimiento reducido"];
        else {
            var visto;
            try {
                visto = sessionStorage.getItem(CLAVE);
                sessionStorage.setItem(CLAVE, "1");   // también en páginas interiores
                r = visto ? [false, "ya se mostró en esta sesión"]
                          : [true, "entrada directa a Inicio"];
            } catch (e) {
                r = [false, "almacenamiento bloqueado"];
            }
        }
        console.log("[Códice emblema] " + (r[0] ? "se anima" : "estático") + " — " + r[1]);
        return r[0];
    }

    /* ---------- Emblema (estado final = estático) ---------- */
    function P(d, s, l) {
        return '<path d="' + d + '" data-s="' + s + '" data-d="' + l + '"/>';
    }

    var SVG =
        '<svg viewBox="0 1 40 40" aria-hidden="true" focusable="false">' +

        '<g class="fijo">' +
            P("M20 34H13", 0, .24) + P("M20 34H27", 0, .24) +
            P("M20 36.4H15.5", .08, .2) + P("M20 36.4H24.5", .08, .2) +
            P("M18.4 34V11.4", .12, .46) + P("M21.6 34V11.4", .12, .46) +
            P("M18.4 29H21.6", .3, .14) + P("M18.4 17H21.6", .38, .14) +
            P("M18.4 11.4H21.6", .46, .12) +
            P("M20 7.4V4.8", .56, .14) +
            '<circle class="pivote" cx="20" cy="9" r="1.6" fill="currentColor" data-s=".5" data-d=".22"/>' +
        '</g>' +

        '<g transform="translate(20 9)"><g class="viga">' +
            P("M-1.6 0H-8.3", .68, .24) + P("M1.6 0H8.3", .68, .24) +
            '<circle class="bead" cx="-8.3" cy="0" r=".85" fill="currentColor" stroke="none" data-s=".9" data-d=".16"/>' +
            '<circle class="bead" cx="8.3" cy="0" r=".85" fill="currentColor" stroke="none" data-s=".9" data-d=".16"/>' +
        '</g></g>' +

        '<g class="pi">' +
            P("M11.7 9L5 22", .84, .26) + P("M11.7 9L18.4 22", .84, .26) +
            P("M5 22C6.2 24.5 8.8 25.4 11.7 25.4C14.6 25.4 17.2 24.5 18.4 22", 1.04, .42) +
        '</g>' +

        '<g class="pd">' +
            P("M28.3 9L35 22", 1.5, .24) + P("M28.3 9L21.6 22", 1.5, .24) +
            P("M35 22C33.8 24.5 31.2 25.4 28.3 25.4C25.4 25.4 22.8 24.5 21.6 22", 1.64, .42) +
        '</g>' +

        '</svg>';

    /* ---------- Animación ---------- */
    var T = 2.8;           // duración total (s)
    var L = 8.3;           // distancia pivote → extremo del brazo
    var NS = "http://www.w3.org/2000/svg";
    var svg, items, viga, pi, pd, pivote, onda, raf = 0, t0 = null;

    function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function suave(p) { return 1 - Math.pow(1 - p, 3); }

    /* Inclinación del brazo: se carga a la izquierda y, al llegar el
       segundo platillo, se suelta y oscila hasta el equilibrio. */
    function angulo(t) {
        var t1 = 1.0, t2 = 1.64;
        if (t <= t1) return 0;
        if (t < t2) {
            return -AMPLITUD * (0.5 - 0.5 * Math.cos(Math.PI * (t - t1) / (t2 - t1)));
        }
        var u = t - t2;
        return -AMPLITUD * Math.exp(-3.3 * u) * Math.cos(2 * Math.PI * u / 0.72);
    }

    function aplicar(t) {
        var i, o, p;

        for (i = 0; i < items.length; i++) {
            o = items[i];
            p = suave(clamp((t - o.s) / o.d));
            if (o.bead) o.el.setAttribute("r", (0.85 * p).toFixed(3));
            else o.el.style.strokeDashoffset = (1 - p).toFixed(4);
        }

        var a = angulo(t), r = a * Math.PI / 180;
        var dx = L * (Math.cos(r) - 1), dy = L * Math.sin(r);
        viga.setAttribute("transform", "rotate(" + a.toFixed(3) + ")");
        pi.setAttribute("transform", "translate(" + (-dx).toFixed(3) + " " + (-dy).toFixed(3) + ")");
        pd.setAttribute("transform", "translate(" + dx.toFixed(3) + " " + dy.toFixed(3) + ")");

        /* Acento final: el pivote se rellena y emite un anillo tenue */
        pivote.style.fillOpacity = suave(clamp((t - 2.28) / 0.18)).toFixed(3);
        pivote.setAttribute("r", (1.6 + 0.35 * Math.sin(Math.PI * clamp((t - 2.28) / 0.3))).toFixed(3));

        p = clamp((t - 2.3) / 0.5);
        onda.setAttribute("r", (1.6 + 3.8 * suave(p)).toFixed(3));
        onda.style.strokeOpacity = (0.5 * (1 - p)).toFixed(3);
    }

    function montar() {
        logo.innerHTML = SVG;
        svg = logo.firstChild;
        viga = svg.querySelector(".viga");
        pi = svg.querySelector(".pi");
        pd = svg.querySelector(".pd");
        pivote = svg.querySelector(".pivote");
    }

    function terminar() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (!svg) return;
        var els = svg.querySelectorAll("[data-s]"), i;
        for (i = 0; i < els.length; i++) {
            els[i].removeAttribute("style");
            if (els[i].classList.contains("bead")) els[i].setAttribute("r", ".85");
        }
        viga.removeAttribute("transform");
        pi.removeAttribute("transform");
        pd.removeAttribute("transform");
        pivote.removeAttribute("style");
        pivote.setAttribute("r", "1.6");
        if (onda && onda.parentNode) onda.parentNode.removeChild(onda);
        onda = null;
    }

    function iniciar() {
        var els = svg.querySelectorAll("[data-s]"), i, e;
        items = [];
        for (i = 0; i < els.length; i++) {
            e = els[i];
            var bead = e.classList.contains("bead");
            if (!bead) {
                e.setAttribute("pathLength", "1");
                e.style.strokeDasharray = "1 2";
            }
            items.push({ el: e, s: +e.getAttribute("data-s"),
                         d: +e.getAttribute("data-d"), bead: bead });
        }
        onda = document.createElementNS(NS, "circle");
        onda.setAttribute("cx", "20");
        onda.setAttribute("cy", "9");
        onda.setAttribute("fill", "none");
        onda.setAttribute("stroke-width", ".7");
        svg.appendChild(onda);

        t0 = null;
        aplicar(0);                       // estado inicial: todo oculto

        (function cuadro(ahora) {
            if (t0 === null) t0 = ahora;
            var t = (ahora - t0) / 1000 * VELOCIDAD;
            if (t >= T) { terminar(); return; }
            aplicar(t);
            raf = requestAnimationFrame(cuadro);
        })(performance.now());
    }

    /* ---------- Arranque ---------- */
    function liberar() {
        // Quita el ocultamiento que index.html puso en <head>
        document.documentElement.classList.remove("emb-pendiente");
    }

    function arrancar() {
        logo = document.querySelector(".logo-symbol");
        if (!logo) { console.warn("[Códice emblema] no se encontró .logo-symbol"); liberar(); return; }
        if (decidir()) { montar(); iniciar(); }   // si no, queda el emblema estático del HTML
        liberar();                                // mismo ciclo: sin parpadeo
    }

    console.log("[Códice emblema] archivo cargado");
    if (document.querySelector(".logo-symbol")) arrancar();
    else document.addEventListener("DOMContentLoaded", arrancar);

    window.addEventListener("pageshow", function (e) {
        if (!e.persisted) return;                 // volver con «atrás» (caché del navegador)
        if (MODO_PRUEBA) window.codiceEmblema.reproducir();
        else terminar();
    });

    /* Para probar desde la consola: codiceEmblema.reproducir() */
    window.codiceEmblema = {
        reproducir: function () {
            if (!logo) return;
            terminar();
            montar();
            iniciar();
        }
    };
})();
