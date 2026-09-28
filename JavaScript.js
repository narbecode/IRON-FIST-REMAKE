const intro = document.getElementById("intro");
const salto = document.getElementById("btn-skip");
const menu = document.getElementById("menu-screen");
const historia = document.getElementById("historia");
const boton_jugar = document.querySelector(".boton-jugar");
const reglas = document.getElementById("Reglas");
const juego = document.getElementById("Seccion_Juego");
const iniciar = document.getElementById("iniciar");

function control_visual(ocultar, mostrar) {

    if (ocultar) {
        ocultar.classList.add("hidden");
    }
    if (mostrar) {
        mostrar.classList.remove("hidden");
    }

}

let introTimer = setTimeout(function () {
    control_visual(intro, menu)
}, 3000);

salto.addEventListener('click', () => {
    clearTimeout(introTimer);              // Cancela el reloj automático de 3.8s
    intro.classList.add('hidden');        // Oculta la intro
    menu.classList.remove('hidden'); // Muestra el menú de inmediato
});

boton_jugar.addEventListener('click', () => {
    control_visual(menu, historia)
});


// ============================================================================
// 1. DATOS DEL CÓMIC (Imágenes, Capítulos y Diálogos)
// ============================================================================
const COMIC_PANELS = [
    {
        image: 'IMG/comic_01.jpg',
        audio: 'narracion1.aac',
        chapter: 'CAPÍTULO I: EL DESCUBRIMIENTO',
        caption: 'En cierto día, los observatorios astronómicos de todo el planeta detectaron una anomalía cósmica sin precedentes: una densa lluvia de meteoritos gigantescos en trayectoria directa de colisión contra la Tierra.'
    },
    {
        image: 'IMG/comic_02.jpg',
        audio: 'narracion2.aac',
        chapter: 'CAPÍTULO I: LA ALERTA GLOBAL',
        caption: 'El resultado fue inmediato: las cadenas de noticias transmitieron la alarma roja. Miles de ciudadanos salieron a las calles exigiendo respuestas mientras el cielo comenzaba a teñirse de fuego y escombros.'
    },
    {
        image: 'IMG/comic_03.jpg',
        audio: 'narracion3.aac',
        chapter: 'CAPÍTULO I: NUESTRA SALVACIÓN',
        caption: 'Pero los gobiernos no estaban indefensos. En secreto activaron la iniciativa "IRON FIST": los proyectiles cinéticos orbitales más letales jamás construidos... ¡nuestra última y única esperanza!'
    }
];

// ============================================================================
// 2. REFERENCIAS A ELEMENTOS DEL DOM DEL CÓMIC
// ============================================================================
let comicIndex = 0; // Viñeta actual (inicia en 0 = viñeta 1)

const comicImg = document.getElementById("comic-img");
const comicTitulo = document.querySelector(".historia-titulo");
const comicTexto = document.querySelector(".texto-comic");
const indicadores = document.querySelectorAll(".indicador-historia");

const btnComicPrev = document.getElementById("btn-comic-prev");
const btnComicNext = document.getElementById("btn-comic-next");
const btnComicSkip = document.getElementById("btn-comic-skip");
const btnIniciarJuego = document.getElementById("btn-iniciar_juego");
const btnComicAudio = document.getElementById("btn-comic-audio");
const comicAudioIcon = document.getElementById("comic-audio-icon");

// Objeto de audio para la narración hablada
// Una pista por escena; cambiar de viñeta invalida cualquier reproducción pendiente.
const audioNarracion = new Audio();
audioNarracion.preload = 'metadata';
let versionNarracion = 0;
function actualizarBotonNarracion(sonando) {
    if (comicAudioIcon) comicAudioIcon.className = sonando ? 'fas fa-pause' : 'fas fa-volume-up';
    if (btnComicAudio) {
        btnComicAudio.setAttribute('aria-pressed', String(sonando));
        btnComicAudio.setAttribute('aria-label', `${sonando ? 'Pausar' : 'Reproducir'} narración de la escena ${comicIndex + 1}`);
    }
}
function detenerNarracion() {
    versionNarracion++;
    audioNarracion.pause();
    try { audioNarracion.currentTime = 0; } catch (_) { /* Aún no hay metadatos. */ }
    actualizarBotonNarracion(false);
}

// ============================================================================
// 3. FUNCIÓN DE RENDERIZADO DEL CÓMIC (Sincroniza imagen, textos y botones)
// ============================================================================
function renderizarComic() {
    detenerNarracion();
    const panel = COMIC_PANELS[comicIndex];
    audioNarracion.src = panel.audio;
    audioNarracion.load();
    if (btnComicAudio) { btnComicAudio.title = 'Narración de la escena ' + (comicIndex + 1); }

    // Actualiza imagen, texto narrativo y título con el número de página
    if (comicImg) comicImg.src = panel.image;
    if (comicTexto) comicTexto.innerText = panel.caption;
    if (comicTitulo) comicTitulo.innerText = `${panel.chapter} (${comicIndex + 1}/${COMIC_PANELS.length})`;

    // Sincroniza los puntos luminosos de progreso (dots)
    indicadores.forEach((punto, idx) => {
        punto.classList.toggle("active", idx === comicIndex);
    });

    // En la primera viñeta (0), oculta el botón "Anterior"
    if (btnComicPrev) {
        btnComicPrev.style.display = (comicIndex === 0) ? "none" : "flex";
    }

    // En la última viñeta (2): Oculta "Siguiente" y Muestra el botón brillante "JUGAR"
    if (comicIndex === COMIC_PANELS.length - 1) {
        if (btnComicNext) btnComicNext.style.display = "none";
        if (btnIniciarJuego) btnIniciarJuego.style.display = "flex";
    } else {
        if (btnComicNext) btnComicNext.style.display = "flex";
        if (btnIniciarJuego) btnIniciarJuego.style.display = "none";
    }
}

// ============================================================================
// 4. CONTROLADORES DE EVENTOS DE NAVEGACIÓN
// ============================================================================

// Viñeta Siguiente
if (btnComicNext) {
    btnComicNext.addEventListener("click", () => {
        if (comicIndex < COMIC_PANELS.length - 1) {
            comicIndex++;
            renderizarComic();
        }
    });
}

// Viñeta Anterior
if (btnComicPrev) {
    btnComicPrev.addEventListener("click", () => {
        if (comicIndex > 0) {
            comicIndex--;
            renderizarComic();
        }
    });
}

// Clic directo en los circulitos indicadores para saltar a cualquier viñeta
indicadores.forEach((punto, idx) => {
    punto.style.cursor = "pointer";
    punto.addEventListener("click", () => {
        comicIndex = idx;
        renderizarComic();
    });
});

// Botón "Volver al Menú"
if (btnComicSkip) {
    btnComicSkip.addEventListener("click", () => {
        // Pausa la narración si estaba sonando
        detenerNarracion();

        // Regresa al menú principal
        control_visual(historia, menu);
    });
}

// Reproducir únicamente por solicitud; al avanzar no se inicia automáticamente otra voz.
if (btnComicAudio) {
    btnComicAudio.addEventListener('click', async () => {
        if (!audioNarracion.paused) { versionNarracion++; audioNarracion.pause(); actualizarBotonNarracion(false); return; }
        const version = ++versionNarracion;
        try {
            await audioNarracion.play();
            if (version !== versionNarracion || historia.classList.contains('hidden')) {
                // load() al cambiar de escena ya cancela la pista antigua; no detener una reproducción nueva.
                if (historia.classList.contains('hidden')) audioNarracion.pause();
                return;
            }
            actualizarBotonNarracion(true);
        } catch (_) {
            if (version === versionNarracion) { actualizarBotonNarracion(false); btnComicAudio.title = 'No se pudo reproducir la narración; vuelve a intentarlo.'; }
        }
    });
}
audioNarracion.addEventListener('ended', () => actualizarBotonNarracion(false));
audioNarracion.addEventListener('error', () => {
    actualizarBotonNarracion(false);
    if (btnComicAudio) btnComicAudio.title = 'La narración no está disponible en este navegador.';
});
document.addEventListener('visibilitychange', () => { if (document.hidden) detenerNarracion(); });

// Botón "JUGAR" al final del cómic (Pasa a las reglas o inicia el juego)
if (btnIniciarJuego) {
    btnIniciarJuego.addEventListener("click", () => {
        detenerNarracion();
        // Oculta la historia y muestra las reglas o el juego

        control_visual(historia, reglas);
    });
}

// ============================================================================
// 5. APERTURA DESDE EL MENÚ PRINCIPAL
// ============================================================================
if (boton_jugar) {
    boton_jugar.addEventListener("click", () => {
        comicIndex = 0;       // Reinicia el cómic en la viñeta 1
        renderizarComic();    // Dibuja la primera viñeta
        control_visual(menu, historia); // Oculta el menú y muestra la historia
    });
}

iniciar.addEventListener("click", () => {
    control_visual(reglas, juego);
    partida.iniciar();
});

const btnReglasVolver = document.getElementById("btn-reglas-volver");
if (btnReglasVolver) {
    btnReglasVolver.addEventListener("click", () => {
        renderizarComic();
        control_visual(reglas, historia);
    });
}


// La partida administra su tiempo y puntaje sin variables globales implícitas.



Graficos = 1 //Este es el medidor de graficos

//En esta funcion cambio de fondo al presionar el CHEKBOX, para graurar los graficos dentro del juego
function Graficos_fondo() {
    Contenedor_RQ = document.getElementById("Contenedor_RC")
    if (Graficos == 1) {
        document.getElementById("Recursos").style.marginLeft = "60%"
        document.getElementById("Fondo").style.background = "url(IMG/Fondo_Espacio2.jpg)"
        document.getElementById("Fondo").style.backgroundAttachment = "fixed"
        document.getElementById("Fondo").style.backgroundRepeat = "no-repeat"
        document.getElementById("Fondo").style.backgroundSize = "100% 120%"
        Graficos = 2
    }
    else {
        document.getElementById("Recursos").style.marginLeft = "0%"
        document.getElementById("Fondo").style.backgroundImage = "url(IMG/Fondo_Espacio.gif) "
        Graficos = 1
    }
}






// PARTIDA: reglas originales y presentación aprobada del remake v2.
// Todo se representa con etiquetas HTML, imágenes y estilos de Estilos.css.
const partida = (() => {
    const seccion = document.getElementById('Seccion_Juego');
    const $ = id => seccion.querySelector('#' + id);
    // Configuración única: misma meta y tiempo que las reglas; dificultad por cantidad y velocidad.
    const niveles = [
        { nombre: 'PEZ GLOBO', meta: 30, tiempo: 60, grupo: 2, intervalo: 2.5, recorrido: 9.5 },
        { nombre: 'TIBURÓN', meta: 30, tiempo: 60, grupo: 3, intervalo: 2.2, recorrido: 5.8 },
        { nombre: 'MEGALODÓN', meta: 30, tiempo: 60, grupo: 4, intervalo: 1.8, recorrido: 3.6 }
    ];
    let estado = 'INACTIVO', nivel = 0, puntos = 0, tiempo = 60, cuenta = 3.06;
    let anteriorEstado = '', proximaOleada = 0, meteoritos = [], secuencia = 0;
    let ancho = 1, alto = 1, vertical = false, hudAbajo = 80, giroTierra = 0;
    let frame = null, ultimoTiempo = null, puntero = null, ultimoPunto = null;
    let escudo = 100, impactosTierra = 0, silenciado = false, versionAudio = 0, ultimoSonido = 0;
    const nodos = new Map(), pistas = [...seccion.querySelectorAll('audio')];
    pistas.forEach(a => a.volume = a.id === 'musica-partida' ? .25 : .55);

    // Un cambio de estado invalida reproducciones asíncronas y detiene todas las pistas anteriores.
    function detenerSonidos() { versionAudio++; pistas.forEach(a => a.pause()); }
    function reproducir(id, reiniciar = true) {
        if (silenciado) return;
        const audio = $(id), version = versionAudio;
        if (!audio) return;
        if (reiniciar) { try { audio.currentTime = 0; } catch (_) { /* Audio aún cargando. */ } }
        const promesa = audio.play();
        if (promesa) promesa.then(() => {
            if (version !== versionAudio && ['PAUSA', 'INACTIVO'].includes(estado)) audio.pause();
        }).catch(() => { /* Un bloqueo de audio nunca detiene el juego. */ });
    }

    // Los puntos de estrella usan la distribución del v2; son pequeños elementos HTML.
    for (let i = 0; i < 45; i++) {
        const n = document.createElement('i'); n.className = 'estrella';
        const d = i % 3 === 0 ? 3.6 : 2;
        n.style.cssText = `left:${(Math.sin(i * 123) * .5 + .5) * 100}%;top:${(Math.cos(i * 456) * .5 + .5) * 100}%;width:${d}px;height:${d}px;transform:translate(-50%,-50%)`;
        $('estrellas').append(n);
    }

    // Preparación centralizada: no se registran eventos ni se crean relojes por cada nivel.
    function preparar(indice) {
        if (!Number.isInteger(indice) || indice < 0 || indice >= niveles.length) return;
        detenerSonidos(); cerrarPaneles(); nivel = indice; puntos = 0; escudo = 100; impactosTierra = 0;
        tiempo = niveles[nivel].tiempo; cuenta = 3.06; meteoritos = []; proximaOleada = 0;
        estado = 'CUENTA'; ultimoTiempo = null; limpiarGesto();
        $('badge-title').textContent = `LVL ${nivel + 1}: ${niveles[nivel].nombre}`;
        dibujar(); actualizarHUD(); programar();
    }
    function iniciar() {
        if (estado !== 'INACTIVO') return;
        detenerNarracion(); document.body.classList.add('orbita-activa'); medir(); preparar(0);
    }

    // El único bucle se suspende en pausa o resultado; dt es tiempo transcurrido, no número de frames.
    function programar() {
        if (frame !== null || !['CUENTA', 'JUGANDO'].includes(estado)) return;
        frame = requestAnimationFrame(ahora => {
            const dt = ultimoTiempo === null ? 0 : Math.min(.1, (ahora - ultimoTiempo) / 1000);
            ultimoTiempo = ahora; actualizar(dt); dibujar(); actualizarHUD();
            frame = null; programar();
        });
    }
    function actualizar(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;
        dt = Math.min(dt, .1);
        if (estado === 'CUENTA') {
            cuenta = Math.max(0, cuenta - dt);
            if (cuenta <= 1e-6) {
                estado = 'JUGANDO'; oleada(); proximaOleada = niveles[nivel].intervalo;
                reproducir('musica-partida', false); $('campo-orbital').focus({ preventScroll: true });
            }
            return;
        }
        if (estado !== 'JUGANDO') return;
        tiempo = Math.max(0, tiempo - dt);
        if (tiempo <= 1e-6) { tiempo = 0; perder('Se agotaron los 60 segundos antes de alcanzar los 30 puntos.'); return; }
        giroTierra += dt * .2;

        // La Tierra aguanta hasta 3 impactos; en el tercer impacto se produce la derrota.
        for (let i = meteoritos.length - 1; i >= 0; i--) {
            const m = meteoritos[i];
            m.progreso += m.velocidad * dt;
            m.angulo += dt * m.giro;
            if (m.progreso >= 1) {
                meteoritos.splice(i, 1);
                impactosTierra++;
                escudo = Math.max(0, Math.round((3 - impactosTierra) / 3 * 100));

                if (impactosTierra >= 3) {
                    escudo = 0;
                    perder('¡El escudo planetario colapsó tras recibir 3 impactos directos!');
                    return;
                } else {
                    // Daño recibido absorbido por la barrera (impacto 1 o 2)
                    reproducir('sonido-derrota');
                    $('tierra').classList.add('escudo-critico');
                    setTimeout(() => {
                        if (estado === 'JUGANDO') {
                            $('tierra').classList.toggle('escudo-critico', escudo <= 34);
                        }
                    }, 400);
                }
            }
        }
        proximaOleada -= dt;
        if (proximaOleada <= 0) { oleada(); proximaOleada += niveles[nivel].intervalo; }
    }

    // Grupos simultáneos con velocidades aleatorias individuales y trayectorias no rígidas (angulares y ondulantes)
    function oleada() {
        const n = niveles[nivel];
        const faltantesParaMeta = Math.max(0, Math.ceil((n.meta - puntos) / 2));
        const maxEnPantalla = n.grupo * 3;
        const cupoDisponible = maxEnPantalla - meteoritos.length;
        const cantidad = Math.min(n.grupo, cupoDisponible, Math.max(1, faltantesParaMeta - meteoritos.length));
        if (cantidad <= 0) return;

        for (let i = 0; i < cantidad; i++) {
            // Posición de entrada con separación para evitar solapamientos iniciales
            const carrilInicio = (i + 0.15 + Math.random() * 0.7) / cantidad;
            // Destino en el perímetro: ángulo oblicuo no paralelo para evitar rigidez en una sola dirección
            const carrilFin = Math.max(0.06, Math.min(0.94, carrilInicio + (Math.random() - 0.5) * 0.55));

            // Velocidades aleatorias variadas: entre 62% y 142% de la velocidad base (algunos rápidos, otros pausados)
            const factorVelocidad = 0.62 + Math.random() * 0.80;
            const velocidad = factorVelocidad / n.recorrido;

            // Ondulación / curvatura cósmica no lineal para dinamismo en la trayectoria
            const tieneOnda = Math.random() < 0.65;
            const amplitudOnda = tieneOnda ? (Math.random() * 26 + 10) * (Math.random() < 0.5 ? 1 : -1) : 0;
            const frecuenciaOnda = Math.random() * 2 + 1; // 1 a 3 oscilaciones en el recorrido

            meteoritos.push({
                id: ++secuencia,
                progreso: 0,
                carrilInicio,
                carrilFin,
                amplitudOnda,
                frecuenciaOnda,
                velocidad,
                angulo: Math.random() * 360,
                giro: (Math.random() * 40 + 20) * (Math.random() < 0.5 ? 1 : -1)
            });
        }
    }

    // El progreso es independiente de la resolución: calcula avance y posición lateral con deriva y curvas
    function posiciones() {
        const radio = ancho < 600 ? 28 : 34;
        const limite = vertical ? alto * .80 : ancho * .78;
        const desde = vertical ? radio + 10 : hudAbajo + radio + 12;
        const hasta = (vertical ? ancho : alto) - radio - 12;
        const rangoCarril = Math.max(1, hasta - desde);

        return meteoritos.map(m => {
            const avance = -radio + m.progreso * limite;
            // Trayectoria diagonal oblicua: interpolación progresiva del carril inicial al carril final
            const baseCarril = m.carrilInicio + (m.carrilFin - m.carrilInicio) * m.progreso;
            // Desviación sinusoidal orgánica
            const onda = m.amplitudOnda ? Math.sin(m.progreso * Math.PI * m.frecuenciaOnda) * m.amplitudOnda : 0;
            // Posición transversal resultante acotada
            const posLateral = Math.max(desde, Math.min(hasta, desde + baseCarril * rangoCarril + onda));

            return {
                ...m,
                radio,
                x: vertical ? posLateral : avance,
                y: vertical ? avance : posLateral
            };
        });
    }
    function medir() {
        const rect = seccion.getBoundingClientRect(); if (rect.width <= 0 || rect.height <= 0) return;
        ancho = rect.width; alto = rect.height; vertical = alto > ancho;
        seccion.dataset.vertical = vertical; hudAbajo = $('hud-top').getBoundingClientRect().bottom;
        limpiarGesto(); dibujar();
    }

    // Geometría de segmento para detectar un barrido rápido entre muestras del ratón o dedo.
    function tocaSegmento(ax, ay, bx, by, cx, cy, radio) {
        const dx = bx - ax, dy = by - ay, longitud = dx * dx + dy * dy;
        const t = longitud === 0 ? 0 : Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / longitud));
        return Math.hypot(cx - ax - t * dx, cy - ay - t * dy) <= radio;
    }
    function desviar(id) {
        if (estado !== 'JUGANDO') return false;
        const indice = meteoritos.findIndex(m => m.id === id); if (indice < 0) return false;
        meteoritos.splice(indice, 1);
        // Cada meteorito destruido otorga 2 puntos
        puntos = Math.min(niveles[nivel].meta, puntos + 2);
        if (performance.now() - ultimoSonido > 65) { reproducir('sonido-punto'); ultimoSonido = performance.now(); }
        if (puntos >= niveles[nivel].meta) ganar();
        actualizarHUD(); dibujar(); return true;
    }
    function cortar(a, b) {
        if (estado !== 'JUGANDO' || ![a.x, a.y, b.x, b.y].every(Number.isFinite)) return;
        for (const m of posiciones()) if (tocaSegmento(a.x, a.y, b.x, b.y, m.x, m.y, m.radio + 5)) desviar(m.id);
    }

    // Los resultados conservan puntos y reloj. Al ganar se reproduce el sonido original de victoria.
    function ganar() {
        if (estado !== 'JUGANDO') return;
        estado = nivel === niveles.length - 1 ? 'FINAL' : 'VICTORIA'; limpiarGesto(); detenerSonidos();
        if (estado === 'FINAL') {
            reproducir('musica-victoria');
            abrirPanel('modal-final');
        } else {
            $('win-level-lbl').textContent = nivel + 1;
            $('win-pts').textContent = puntos;
            $('win-time').textContent = Math.ceil(tiempo) + ' s';
            // Sonido de victoria del juego original (fanfare-triumphal.mp3)
            reproducir('sonido-victoria');
            abrirPanel('modal-win');
        }
    }
    function perder(motivo) {
        if (estado !== 'JUGANDO') return;
        estado = 'DERROTA'; limpiarGesto(); detenerSonidos(); reproducir('sonido-derrota');
        $('gameover-reason').textContent = motivo; $('gameover-score').textContent = `${puntos} / ${niveles[nivel].meta} puntos`;
        abrirPanel('modal-gameover');
    }
    function cerrarPaneles() {
        seccion.querySelectorAll('.modal-backdrop').forEach(p => p.classList.add('hidden'));
        $('campo-orbital').inert = false; $('hud-top').inert = false;
    }
    function abrirPanel(id) {
        cerrarPaneles(); $(id).classList.remove('hidden'); $('campo-orbital').inert = true; $('hud-top').inert = true;
        // Foco en el panel: el último Espacio de ataque no activa un botón del resultado.
        $(id).focus({ preventScroll: true });
    }
    function pausar() {
        if (!['CUENTA', 'JUGANDO'].includes(estado)) return;
        anteriorEstado = estado; estado = 'PAUSA'; ultimoTiempo = null; limpiarGesto(); detenerSonidos(); abrirPanel('modal-menu-ingame');
    }
    function reanudar() {
        if (estado !== 'PAUSA') return;
        cerrarPaneles(); estado = anteriorEstado; ultimoTiempo = null;
        if (estado === 'JUGANDO') reproducir('musica-partida', false);
        $('campo-orbital').focus({ preventScroll: true }); programar();
    }
    function salir() {
        estado = 'INACTIVO'; detenerSonidos(); limpiarGesto(); cerrarPaneles();
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null; ultimoTiempo = null; meteoritos = []; dibujar();
        seccion.classList.add('hidden'); document.body.classList.remove('orbita-activa');
        document.getElementById('menu-screen').classList.remove('hidden'); document.querySelector('.boton-jugar').focus({ preventScroll: true });
    }

    // Actualizaciones pequeñas del DOM; cada imagen vive solo mientras su meteorito está activo.
    function dibujar() {
        const vivos = new Set(meteoritos.map(m => m.id));
        for (const [id, n] of nodos) if (!vivos.has(id)) { const enfocado = document.activeElement === n; n.remove(); nodos.delete(id); if (enfocado && estado === 'JUGANDO') $('campo-orbital').focus({ preventScroll: true }); }
        const radioTierra = Math.min(160, vertical ? ancho * .45 : alto * .35);
        $('tierra').style.cssText = `left:${ancho * (vertical ? .5 : .94) - radioTierra}px;top:${alto * (vertical ? .98 : .5) - radioTierra}px;width:${radioTierra * 2}px;height:${radioTierra * 2}px`;
        $('tierra').querySelector('img').style.transform = `rotate(${giroTierra}rad)`;
        for (const m of posiciones()) {
            let n = nodos.get(m.id);
            if (!n) {
                n = document.createElement('button'); n.type = 'button'; n.className = 'meteorito'; n.dataset.id = m.id;
                n.setAttribute('aria-label', 'Desviar meteorito');
                const imagen = document.createElement('img'); imagen.src = 'IMG/Metiorito.png'; imagen.alt = ''; imagen.draggable = false;
                n.append(imagen); $('meteoritos').append(n); nodos.set(m.id, n);
            }
            n.style.width = n.style.height = m.radio * 2 + 'px';
            n.style.transform = `translate(${m.x - m.radio}px,${m.y - m.radio}px)`;
            n.firstElementChild.style.transform = `rotate(${m.angulo}deg)`; n.disabled = estado !== 'JUGANDO';
        }
    }
    function actualizarHUD() {
        const texto = (id, valor) => { if ($(id).textContent !== String(valor)) $(id).textContent = valor; };
        texto('hud-pts', `${puntos} / ${niveles[nivel].meta}`); texto('hud-time', Math.ceil(tiempo));
        texto('shield-pct', escudo + '%'); $('shield-fill').style.width = escudo + '%';
        $('tierra').classList.toggle('escudo-critico', escudo === 0);
        const contando = estado === 'CUENTA' || (estado === 'PAUSA' && anteriorEstado === 'CUENTA');
        $('countdown-overlay').classList.toggle('hidden', !contando);
        if (contando) {
            texto('countdown-text', cuenta > 2.36 ? '3' : cuenta > 1.66 ? '2' : cuenta > .96 ? '1' : '¡A DEFENDER!');
            $('countdown-text').classList.toggle('countdown-shrink', cuenta <= .26);
        }
    }

    // Eventos instalados una sola vez, compartidos por los tres niveles y todos los reintentos.
    function limpiarGesto() { puntero = null; ultimoPunto = null; }
    const campo = $('campo-orbital');
    const coordenadas = e => { const r = campo.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    campo.addEventListener('pointerdown', e => {
        if (estado !== 'JUGANDO' || e.button !== 0 || puntero !== null) return;
        e.preventDefault(); puntero = e.pointerId; campo.setPointerCapture(e.pointerId); ultimoPunto = coordenadas(e); cortar(ultimoPunto, ultimoPunto);
    });
    campo.addEventListener('pointermove', e => {
        if (estado !== 'JUGANDO' || (e.pointerType !== 'mouse' && e.pointerId !== puntero)) return;
        const p = coordenadas(e);
        if (p.x < 0 || p.y < 0 || p.x > ancho || p.y > alto) { ultimoPunto = null; return; }
        cortar(ultimoPunto || p, p); ultimoPunto = p;
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave']) campo.addEventListener(ev, limpiarGesto);
    campo.addEventListener('click', e => {
        // Las activaciones de teclado y lector tienen detail 0; el ratón ya se atendió arriba.
        const n = e.target.closest('.meteorito'); if (n && e.detail === 0) desviar(Number(n.dataset.id));
    });
    campo.addEventListener('keydown', e => {
        if (e.target !== campo || e.repeat || ![' ', 'Enter'].includes(e.key)) return;
        e.preventDefault(); const m = [...meteoritos].sort((a, b) => b.progreso - a.progreso)[0]; if (m) desviar(m.id);
    });
    $('btn-menu').addEventListener('click', pausar);
    $('btn-menu-resume').addEventListener('click', reanudar);
    $('btn-menu-restart').addEventListener('click', () => { if (estado === 'PAUSA') preparar(nivel); });
    $('btn-next-stage').addEventListener('click', () => { if (estado === 'VICTORIA') preparar(nivel + 1); });
    $('btn-retry-stage').addEventListener('click', () => { if (estado === 'DERROTA') preparar(nivel); });
    $('btn-play-again').addEventListener('click', () => { if (estado === 'FINAL') preparar(0); });
    $('btn-volver-menu').addEventListener('click', salir);
    function alternarSonido() {
        silenciado = !silenciado; pistas.forEach(a => a.muted = silenciado);
        $('mute-icon').className = silenciado ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        $('btn-mute').setAttribute('aria-pressed', silenciado); $('btn-mute').setAttribute('aria-label', silenciado ? 'Activar sonido' : 'Silenciar sonido');
        if (silenciado) detenerSonidos(); else if (estado === 'JUGANDO') reproducir('musica-partida', false);
    }
    $('btn-mute').addEventListener('click', alternarSonido);
    document.addEventListener('keydown', e => {
        if (estado === 'INACTIVO' || e.altKey || e.ctrlKey || e.metaKey) return;
        const panel = seccion.querySelector('.modal-backdrop:not(.hidden)');
        if (e.key === 'Tab' && panel) {
            const botones = [...panel.querySelectorAll('button')];
            if (e.shiftKey && (document.activeElement === botones[0] || document.activeElement === panel)) { e.preventDefault(); botones.at(-1).focus(); }
            else if (!e.shiftKey && document.activeElement === botones.at(-1)) { e.preventDefault(); botones[0].focus(); }
        }
        if (e.repeat) return;
        if (e.key.toLowerCase() === 'm') alternarSonido();
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') { e.preventDefault(); estado === 'PAUSA' ? reanudar() : pausar(); }
    });
    window.addEventListener('blur', pausar);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); });
    window.addEventListener('pagehide', () => { detenerSonidos(); detenerNarracion(); });
    new ResizeObserver(medir).observe(seccion);

    // Diagnóstico de solo lectura: permite verificar sin modificar el estado durante las pruebas de interfaz.
    return Object.freeze({ iniciar, resumen: () => ({ estado, nivel: nivel + 1, puntos, tiempo, cuenta, escudo,
        meta: niveles[nivel].meta, meteoritos: meteoritos.map(m => ({ ...m })) }) });
})();


//TRANSICIONES ENTRE PAGINAS----------------------------------------------------------------------------------



function Mover() {//TRANSICION DE LA PRIMERA SECCION A LA SEGUNDA
    var contenedor = document.getElementById("Seccion_01")
    contenedor.style.top = "-100%"
    contenedor.style.transition = "2s"
    function Desaparecer() {
        var contenedor = document.getElementById("Seccion_01")
        var Reglas = document.getElementById("Reglas")

        Reglas.style.top = "3%"
        Reglas.style.transition = "1s"
        contenedor.style.display = "none"


    }
    setTimeout(Desaparecer, 1090)

}


function Mover_2() {
    var Reglas_Sacar = document.getElementById("Reglas")


    Reglas_Sacar.style.top = "-100%"
    Reglas_Sacar.style.transition = "1.4s"



    function Desaparecer2() {
        var Reglas_Sacar = document.getElementById("Reglas")
        var contenedor_2 = document.getElementById("Seccion_2")
        var imagen = document.getElementById("Imagen")
        var mensaje = document.getElementById("Mensaje")
        var titulo = document.getElementById("Titulo_historia")

        Reglas_Sacar.style.display = "none"
        contenedor_2.style.top = "0%"

        imagen.style.left = "2%"
        imagen.style.transition = "2s"
        mensaje.style.right = "2%"
        mensaje.style.transition = "2s"
        titulo.style.left = "2%"
        titulo.style.transition = "1s"
    }
    setTimeout(Desaparecer2, 1260)



}


function Mover_3() {//TRANSICION DE LA SEGUNDA SECCION A LA TERCERA 

    var contenedor_2 = document.getElementById("Seccion_2")
    var Supremo = document.getElementById("Seccion_suprema")

    document.getElementById("narracion").pause()
    contenedor_2.style.top = "-100%"
    contenedor_2.style.transition = "1.4s"
    Supremo.style.height = "160vh" //Le aumente para que no tape al contenedor del juego


    function Desaparaceer3() {
        var Seccion_Juego = document.getElementById("Seccion_Juego")
        var contenedor_2 = document.getElementById("Seccion_2")
        var juego = document.getElementById("Registraar")
        var Titulo_jugar = document.getElementById("Titulo_jugar")
        var Contenedor_juego = document.getElementById("Contenedor_Juego")
        var Cabezara = document.getElementById("Cabezera")

        Seccion_Juego.style.left = "0%"
        contenedor_2.style.display = "none"
        juego.style.top = "0%"
        juego.style.transition = "0s"
        Titulo_jugar.style.left = "0%"
        Titulo_jugar.style.transition = "0.8s"
        Contenedor_juego.style.left = "0%"
        Contenedor_juego.style.transition = "1.2s"
        Cabezara.style.left = "0%"
        Cabezara.style.transition = "1.2s"

    }

    setTimeout(Desaparaceer3, 900)
}

//RELOJ


function Reloj_Tiempo() {
    var actualizar_Hora = function () {
        var Fecha = new Date(),
            Horas = Fecha.getHours(),
            ampm,
            Minutos = Fecha.getMinutes(),
            Segundos = Fecha.getSeconds(),
            diaSemana = Fecha.getDay(),
            dia = Fecha.getDate(),
            mes = Fecha.getMonth(),
            Año = Fecha.getFullYear();

        var pHoras = document.getElementById("Hora"),
            pAMPM = document.getElementById("AMPM"),
            pMinutos = document.getElementById("Minutos"),
            pSegundos = document.getElementById("Segundos"),
            pDia_Semana = document.getElementById("Dia_Semana"),
            pDia = document.getElementById("dia"),
            pMes = document.getElementById("mes"),
            pAño = document.getElementById("año");

        var semana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
        if (!pHoras || !pDia_Semana) return;
        pDia_Semana.textContent = semana[diaSemana];
        pDia.textContent = dia
        var Mes_Actual = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Nomviembre', 'Diciembre']
        pMes.textContent = Mes_Actual[mes];
        pAño.textContent = Año

        if (Horas >= 12) {
            Horas = Horas - 12;
            ampm = 'PM';
        }
        else { ampm = 'AM'; }

        if (Horas == 0) {
            Horas = 12;
        }
        if (Horas < 10) {
            Horas = "0" + Horas
        }
        pHoras.textContent = Horas
        pAMPM.textContent = ampm
        if (Minutos < 10) {
            Minutos = "0" + Minutos
        }
        pMinutos.textContent = Minutos
        if (Segundos < 10) {
            Segundos = "0" + Segundos
        }
        pSegundos.textContent = Segundos
    };
    actualizar_Hora();
}


Reloj_Tiempo()

setInterval(Reloj_Tiempo, 1000)