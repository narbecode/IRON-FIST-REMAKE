/* IRON FIST · Pantallas y representación con elementos HTML. */
(() => {
    'use strict';
    const C = IF_CONFIG;
    const motor = new IF_MOTOR.MotorCampana(C);
    const $ = id => document.getElementById(id);
    const app = $('game-app');
    const campo = $('campo-orbital');
    const video = $('intro-video');
    const sonido = new IF_AUDIO.GestorAudio(C.recursos.audio, video);
    sonido.activar();
    const pantallas = [...document.querySelectorAll('.pantalla')];
    pantallas.forEach(pantalla => pantalla.addEventListener('animationend', evento => {
        if (evento.target === pantalla && evento.animationName === 'entrada-pantalla') pantalla.classList.remove('screen-in');
    }));
    const dialogos = [...document.querySelectorAll('.modal-backdrop')];
    const capas = { meteoritos: $('meteoritos'), proyectiles: $('proyectiles') };
    const nodos = { meteoritos: new Map(), proyectiles: new Map() };
    const movimiento = { arriba: false, abajo: false, dedo: null };
    const retrato = matchMedia('(pointer: coarse) and (orientation: portrait)');
    let pantallaActual = 'intro';
    let cambio = 0;
    let comicIndex = 0;
    let cinematicaCerrada = false;
    let silenciado = false;
    let dialogoActual = null;
    let ultimoFrame = performance.now();
    let focoAnterior = null;
    let fullscreenPendiente = false;

    // los créditos presentan a los cuatro integrantes vigentes.
    C.equipo.forEach(nombre => {
        const integrante = document.createElement('span');
        integrante.className = 'ending-member';
        integrante.textContent = nombre;
        $('ending-team').append(integrante);
    });

    // el escenario ocupa el viewport y el gesto permite activar pantalla completa.
    function actualizarPantallaCompleta() {
        app.dataset.fullscreen = String(Boolean(document.fullscreenElement));
        $('btn-fullscreen').classList.toggle('hidden', Boolean(document.fullscreenElement) || !document.documentElement.requestFullscreen);
    }
    function solicitarPantallaCompleta() {
        if (document.fullscreenElement || fullscreenPendiente || !document.documentElement.requestFullscreen) return;
        fullscreenPendiente = true;
        document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => {
            if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').catch(() => {});
        }).catch(() => {}).finally(() => { fullscreenPendiente = false; });
    }
    document.addEventListener('fullscreenchange', actualizarPantallaCompleta);
    $('btn-fullscreen').addEventListener('click', solicitarPantallaCompleta);
    actualizarPantallaCompleta();
    function habilitarSonido() {
        sonido.activar();
        sonido.silenciar(silenciado);
        if (pantallaActual === 'cinematica' && video.paused && !document.hidden) reproducirCinematica();
    }
    document.addEventListener('pointerdown', habilitarSonido, { once: true });
    // El click se completa antes de cambiar el tamaño de la ventana.
    document.addEventListener('click', solicitarPantallaCompleta, { once: true });
    document.addEventListener('keydown', habilitarSonido, { once: true });
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Tab') document.body.classList.add('usa-teclado');
    });
    document.addEventListener('pointerdown', () => document.body.classList.remove('usa-teclado'));

    // durante el fade saliente ningún control sigue recibiendo acciones.
    async function mostrarPantalla(id) {
        if (pantallaActual === id) return;
        const version = ++cambio;
        const anterior = $(pantallaActual);
        pantallaActual = id;
        app.dataset.pantalla = id;
        anterior.inert = true;
        anterior.classList.remove('screen-in');
        anterior.classList.add('screen-out');
        const siguiente = $(id);
        siguiente.classList.remove('hidden', 'screen-out');
        siguiente.classList.add('screen-in');
        siguiente.inert = true;
        if (id !== 'historia') sonido.detenerVoz();
        await new Promise(resolve => setTimeout(resolve, 400));
        if (version !== cambio) return;
        pantallas.forEach(p => {
            if (p === siguiente) return;
            p.classList.add('hidden');
            p.classList.remove('screen-in', 'screen-out');
            p.inert = true;
        });
        siguiente.inert = false;
        const primerControl = siguiente.querySelector('button:not(.hidden):not(:disabled)');
        if (primerControl && document.body.classList.contains('usa-teclado')) primerControl.focus({ preventScroll: true });
        if (id === 'Seccion_Juego') campo.focus({ preventScroll: true });
    }

    // La cinematográfica comparte el archivo horizontal y su banda sonora en todos los equipos.
    function terminarCinematica() {
        if (cinematicaCerrada) return;
        cinematicaCerrada = true;
        video.pause();
        irMenu();
    }
    async function reproducirCinematica() {
        if (cinematicaCerrada || retrato.matches || document.hidden) return;
        try {
            await video.play();
            if (cinematicaCerrada) video.pause();
        } catch (_) {
            // Chrome permite el arranque automático sin audio antes del primer gesto.
            if (!cinematicaCerrada && pantallaActual === 'cinematica') {
                video.muted = true;
                try {
                    await video.play();
                    if (cinematicaCerrada || document.hidden) video.pause();
                } catch (_) { terminarCinematica(); }
            }
        }
    }
    let introTimer = setTimeout(() => iniciarCinematica(false), 3000);
    function iniciarCinematica(conGesto) {
        if (pantallaActual !== 'intro') return;
        clearTimeout(introTimer);
        if (conGesto) sonido.activar();
        cinematicaCerrada = false;
        mostrarPantalla('cinematica');
        // El play se inicia dentro del gesto; la imagen se descubre mediante el fade.
        reproducirCinematica();
        if (conGesto) solicitarPantallaCompleta();
    }
    $('btn-skip-intro').addEventListener('click', () => iniciarCinematica(true));
    $('btn-skip-video').addEventListener('click', terminarCinematica);
    video.addEventListener('ended', terminarCinematica);
    video.addEventListener('error', () => {
        if (pantallaActual === 'cinematica') terminarCinematica();
    });
    function irMenu() {
        sonido.activar();
        cerrarDialogos();
        motor.salir();
        limpiarCampo();
        sonido.musica('menu');
        sonido.reanudar();
        mostrarPantalla('menu-screen');
    }

    // imagen, texto y voz corresponden al mismo índice.
    const COMIC_PANELS = [
        { image: 'assets/imagenes/comic_01.jpg', chapter: 'CAPÍTULO I: EL DESCUBRIMIENTO', caption: 'En cierto día, los observatorios astronómicos de todo el planeta detectaron una anomalía cósmica sin precedentes: una densa lluvia de meteoritos gigantescos en trayectoria directa de colisión contra la Tierra.' },
        { image: 'assets/imagenes/comic_02.jpg', chapter: 'CAPÍTULO II: LA ALERTA GLOBAL', caption: 'El resultado fue inmediato: las cadenas de noticias transmitieron la alarma roja. Miles de ciudadanos salieron a las calles exigiendo respuestas mientras el cielo comenzaba a teñirse de fuego y escombros.' },
        { image: 'assets/imagenes/comic_03.jpg', chapter: 'CAPÍTULO III: NUESTRA SALVACIÓN', caption: 'Pero los gobiernos no estaban indefensos. En secreto activaron la iniciativa "IRON FIST": los proyectiles cinéticos orbitales más letales jamás construidos... ¡nuestra última y única esperanza!' }
    ];
    function actualizarVoz(estado) {
        const activa = estado.reproduciendo === true;
        $('btn-comic-audio').textContent = activa ? 'Ⅱ NARRACIÓN' : '▶ NARRACIÓN';
        $('btn-comic-audio').setAttribute('aria-pressed', String(activa));
        $('btn-comic-audio').setAttribute('aria-label', `${activa ? 'Pausar' : 'Reproducir'} narración de la escena ${comicIndex + 1}`);
    }
    sonido.onVoz = actualizarVoz;
    function renderizarComic() {
        sonido.detenerVoz();
        actualizarVoz({ reproduciendo: false });
        const panel = COMIC_PANELS[comicIndex];
        $('comic-img').src = panel.image;
        $('comic-img').alt = `Viñeta ${comicIndex + 1}: ${panel.chapter}`;
        document.querySelector('.historia-titulo').textContent = `${panel.chapter} (${comicIndex + 1}/3)`;
        document.querySelector('.texto-comic').textContent = panel.caption;
        $('historia').dataset.escena = String(comicIndex + 1);
        document.querySelectorAll('.indicador-historia').forEach((p, i) => p.classList.toggle('active', i === comicIndex));
        $('btn-comic-prev').classList.toggle('hidden', comicIndex === 0);
        $('btn-comic-next').classList.toggle('hidden', comicIndex === 2);
        $('btn-iniciar_juego').classList.toggle('hidden', comicIndex !== 2);
    }
    document.querySelector('.boton-jugar').addEventListener('click', () => {
        sonido.activar();
        comicIndex = 0;
        renderizarComic();
        sonido.musica('historia');
        mostrarPantalla('historia');
    });
    $('btn-comic-prev').addEventListener('click', () => { if (comicIndex > 0) { comicIndex--; renderizarComic(); } });
    $('btn-comic-next').addEventListener('click', () => { if (comicIndex < 2) { comicIndex++; renderizarComic(); } });
    $('btn-comic-audio').addEventListener('click', () => { sonido.activar(); sonido.voz(comicIndex); });
    $('btn-comic-skip').addEventListener('click', irMenu);
    $('btn-iniciar_juego').addEventListener('click', () => { sonido.musica('historia'); mostrarPantalla('Reglas'); });
    $('btn-reglas-volver').addEventListener('click', () => { comicIndex = 0; renderizarComic(); mostrarPantalla('historia'); });

    function cerrarDialogos() {
        dialogos.forEach(d => d.classList.add('hidden'));
        dialogoActual = null;
        campo.inert = false;
        $('hud-top').inert = false;
        $('btn-disparar').inert = false;
    }
    function abrirDialogo(id) {
        cerrarDialogos();
        focoAnterior = document.activeElement;
        dialogoActual = $(id);
        campo.inert = true;
        $('hud-top').inert = true;
        $('btn-disparar').inert = true;
        dialogoActual.classList.remove('hidden');
        const control = dialogoActual.querySelector('button');
        (control || dialogoActual).focus({ preventScroll: true });
    }
    function limpiarCampo() {
        Object.values(nodos).forEach(mapa => mapa.clear());
        capas.meteoritos.replaceChildren();
        capas.proyectiles.replaceChildren();
        $('efectos').replaceChildren();
        $('countdown-overlay').classList.add('hidden');
        movimiento.dedo = null;
        movimiento.arriba = movimiento.abajo = false;
    }
    function iniciarCampana() {
        cerrarDialogos();
        limpiarCampo();
        sonido.activar();
        motor.nuevaCampana();
        sonido.musica('partida');
        sonido.reanudar();
        mostrarPantalla('Seccion_Juego');
        dibujar(motor.resumen());
    }
    $('iniciar').addEventListener('click', iniciarCampana);
    ['btn-menu-restart', 'btn-retry-stage', 'btn-play-again'].forEach(id => $(id).addEventListener('click', iniciarCampana));
    ['btn-menu-exit', 'btn-derrota-menu', 'btn-volver-menu'].forEach(id => $(id).addEventListener('click', irMenu));
    $('btn-next-stage').addEventListener('click', () => {
        if (motor.estado !== 'VICTORIA') return;
        cerrarDialogos();
        limpiarCampo();
        motor.siguienteNivel();
        sonido.musica('partida');
        sonido.reanudar();
        dibujar(motor.resumen());
        campo.focus({ preventScroll: true });
    });
    function pausarPartida() {
        if (pantallaActual !== 'Seccion_Juego' || !['CUENTA', 'JUGANDO'].includes(motor.estado)) return;
        motor.pausar();
        movimiento.arriba = movimiento.abajo = false;
        movimiento.dedo = null;
        sonido.pausa();
        abrirDialogo('modal-menu-ingame');
    }
    $('btn-menu').addEventListener('click', pausarPartida);
    $('btn-menu-resume').addEventListener('click', () => {
        if (retrato.matches) return;
        cerrarDialogos();
        motor.reanudar();
        sonido.reanudar();
        (focoAnterior && !focoAnterior.closest('.modal-backdrop') ? focoAnterior : campo).focus({ preventScroll: true });
    });
    $('btn-mute').addEventListener('click', () => {
        silenciado = !silenciado;
        sonido.silenciar(silenciado);
        $('btn-mute').textContent = silenciado ? '×♪' : '♪';
        $('btn-mute').setAttribute('aria-pressed', String(silenciado));
        $('btn-mute').setAttribute('aria-label', silenciado ? 'Activar sonido' : 'Silenciar sonido');
    });

    // mover no destruye; solo un proyectil puede causar daño.
    function moverDesdePantalla(clientY) {
        const rect = campo.getBoundingClientRect();
        motor.moverNave((clientY - rect.top) / rect.height * C.mundo.alto);
    }
    campo.addEventListener('pointerdown', e => {
        if (dialogoActual || retrato.matches) return;
        sonido.activar();
        if (e.pointerType !== 'mouse') {
            if (movimiento.dedo !== null) return;
            movimiento.dedo = e.pointerId;
            campo.setPointerCapture(e.pointerId);
            moverDesdePantalla(e.clientY);
            e.preventDefault();
        } else {
            moverDesdePantalla(e.clientY);
            if (e.button === 0) motor.disparar();
        }
    });
    campo.addEventListener('pointermove', e => {
        if (e.pointerType === 'mouse' || e.pointerId === movimiento.dedo) moverDesdePantalla(e.clientY);
    });
    function soltarDedo(e) {
        if (e.pointerId === movimiento.dedo) movimiento.dedo = null;
    }
    campo.addEventListener('pointerup', soltarDedo);
    campo.addEventListener('pointercancel', soltarDedo);
    $('btn-disparar').addEventListener('pointerdown', e => {
        if (dialogoActual || retrato.matches) return;
        e.preventDefault();
        e.stopPropagation();
        sonido.activar();
        motor.disparar();
    });
    // El click accesible funciona con teclado y tecnología de asistencia; el pointer ya disparó.
    $('btn-disparar').addEventListener('click', e => { if (e.detail === 0 && !dialogoActual && !retrato.matches) motor.disparar(); });
    document.addEventListener('keydown', e => {
        if (dialogoActual && e.key === 'Tab') {
            const controles = [...dialogoActual.querySelectorAll('button:not(:disabled)')];
            const extremo = e.shiftKey ? controles[0] : controles.at(-1);
            if (document.activeElement === extremo) { e.preventDefault(); (e.shiftKey ? controles.at(-1) : controles[0]).focus(); }
            return;
        }
        if (pantallaActual !== 'Seccion_Juego') return;
        if (['p', 'P', 'Escape'].includes(e.key)) { e.preventDefault(); pausarPartida(); return; }
        if (dialogoActual || retrato.matches || document.activeElement.tagName === 'BUTTON') return;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); movimiento[e.key === 'ArrowUp' ? 'arriba' : 'abajo'] = true; }
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); sonido.activar(); motor.disparar(); }
    });
    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp') movimiento.arriba = false;
        if (e.key === 'ArrowDown') movimiento.abajo = false;
    });

    // Las posiciones son porcentajes del mundo lógico. El tamaño físico no cambia la colisión.
    function posicionar(elemento, x, y) {
        elemento.style.left = `${x / C.mundo.ancho * 100}%`;
        elemento.style.top = `${y / C.mundo.alto * 100}%`;
        elemento.style.transform = 'translate(-50%, -50%)';
    }
    function representarActores(lista, tipo) {
        const mapa = nodos[tipo];
        const presentes = new Set();
        lista.forEach(actor => {
            presentes.add(actor.id);
            let elemento = mapa.get(actor.id);
            if (!elemento) {
                elemento = document.createElement('div');
                elemento.className = tipo === 'meteoritos' ? 'meteorito' : 'puno-cinetico';
                elemento.dataset.id = actor.id;
                const estela = document.createElement('span');
                estela.className = tipo === 'meteoritos' ? 'estela-meteorito' : 'estela-puno';
                const imagen = document.createElement('img');
                imagen.alt = '';
                imagen.src = tipo === 'meteoritos' ? C.recursos.imagenes.meteoritos[actor.tipo] : C.recursos.imagenes.puno;
                elemento.append(estela, imagen);
                capas[tipo].append(elemento);
                mapa.set(actor.id, elemento);
            }
            posicionar(elemento, actor.x, actor.y);
            elemento.style.width = `${actor.radio * 2 / C.mundo.ancho * 100}%`;
            elemento.style.height = `${actor.radio * 2 / C.mundo.alto * 100}%`;
            if (tipo === 'meteoritos') {
                elemento.dataset.tamano = actor.tipo;
                elemento.dataset.hp = actor.resistencia;
                const dx = actor.x - actor.anteriorX;
                const dy = actor.y - actor.anteriorY;
                if (Number.isFinite(dx) && Math.abs(dx) > 0.001) elemento.style.setProperty('--angle', `${Math.atan2(dy, dx) * 180 / Math.PI}deg`);
                elemento.querySelector('img').style.rotate = `${actor.angulo}deg`;
            }
        });
        mapa.forEach((elemento, id) => { if (!presentes.has(id)) { elemento.remove(); mapa.delete(id); } });
    }
    function dibujar(s) {
        const juego = $('Seccion_Juego');
        Object.assign(juego.dataset, { estado: s.estado, nivel: String(s.nivel + 1), puntos: String(s.puntos), escudo: String(s.escudoCargas), vidas: String(s.vidas), tiempo: s.tiempo.toFixed(2) });
        $('badge-title').textContent = `LVL ${s.nivel + 1}: ${s.nombreNivel}`;
        $('shield-pct').textContent = `${s.escudoCargas} / 3`;
        $('shield-fill').style.width = `${s.escudoCargas / 3 * 100}%`;
        $('shield-fill').classList.toggle('critico', s.escudoCargas === 1);
        $('life-value').textContent = `${s.vidas} / 3`;
        document.querySelectorAll('.life-pip').forEach((p, i) => p.classList.toggle('is-lost', i >= s.vidas));
        $('hud-pts').textContent = `${s.puntos} / ${s.meta}`;
        $('hud-time').textContent = String(Math.ceil(s.tiempo));
        $('tierra').dataset.dano = String(s.danoTierra);
        $('tierra').dataset.escudo = String(s.escudoCargas);
        const nuevaTierra = C.recursos.imagenes.tierra[s.danoTierra];
        const imagenTierra = $('tierra').querySelector('img');
        if (imagenTierra.getAttribute('src') !== nuevaTierra) imagenTierra.src = nuevaTierra;
        $('tierra').querySelector('.arco-escudo').classList.toggle('hidden', s.escudoCargas === 0);
        posicionar($('nave'), s.nave.x, s.nave.y);
        representarActores(s.meteoritos, 'meteoritos');
        representarActores(s.proyectiles, 'proyectiles');
        $('countdown-overlay').classList.toggle('hidden', !['CUENTA', 'PAUSA'].includes(s.estado) || s.cuenta <= 0);
        $('countdown-text').textContent = String(Math.ceil(s.cuenta));
        app.classList.toggle('juego-pausado', s.estado !== 'JUGANDO');
    }

    // explosión CSS multicapa. No añade objetos al motor ni modifica hitboxes.
    function explosion(x, y, grande = false) {
        const contenedor = document.createElement('div');
        contenedor.className = 'explosion';
        posicionar(contenedor, x, y);
        const escala = app.getBoundingClientRect().width / C.mundo.ancho;
        const tamano = (grande ? 180 : 125) * escala;
        contenedor.style.width = `${tamano}px`;
        contenedor.style.height = `${tamano}px`;
        ['explosion-flash', 'explosion-ring', 'explosion-smoke'].forEach(clase => {
            const capa = document.createElement('span'); capa.className = clase; contenedor.append(capa);
        });
        for (let i = 0; i < 8; i++) {
            const fragmento = document.createElement('span');
            fragmento.className = 'fragmento';
            const angulo = i * Math.PI / 4;
            fragmento.style.setProperty('--dx', `${Math.cos(angulo) * tamano * 0.65}px`);
            fragmento.style.setProperty('--dy', `${Math.sin(angulo) * tamano * 0.65}px`);
            fragmento.style.setProperty('--rot', `${i * 73}deg`);
            contenedor.append(fragmento);
        }
        $('efectos').append(contenedor);
        setTimeout(() => contenedor.remove(), 900);
    }
    function destello(elemento, clase, duracion = 500) {
        elemento.classList.remove(clase);
        void elemento.offsetWidth;
        elemento.classList.add(clase);
        setTimeout(() => elemento.classList.remove(clase), duracion);
    }
    function atenderEventos(s) {
        motor.consumirEventos().forEach(e => {
            switch (e.tipo) {
                case 'disparo': sonido.efecto('disparo'); destello($('nave'), 'nave-disparando', 220); break;
                case 'golpe-meteorito': {
                    sonido.efecto('golpe');
                    const nodo = nodos.meteoritos.get(e.id);
                    if (nodo) destello(nodo, 'meteorito-hit', 170);
                    break;
                }
                case 'meteorito-destruido': sonido.efecto('explosion'); explosion(e.x, e.y, e.tipoMeteorito === 'grande'); break;
                case 'escudo-impacto': sonido.efecto('escudo'); destello($('tierra'), 'impacto-escudo'); break;
                case 'escudo-roto': sonido.efecto('rotura'); destello($('tierra'), 'impacto-rotura', 900); break;
                case 'tierra-impacto': sonido.efecto('tierra'); destello($('tierra'), 'impacto-tierra'); explosion(e.x || C.tierra.x, e.y || C.tierra.y, true); break;
                case 'victoria':
                    $('win-level-lbl').textContent = String(s.nivel + 1);
                    $('win-pts').textContent = String(s.puntos);
                    $('win-time').textContent = `${Math.ceil(s.tiempo)} s`;
                    sonido.musica('logro', false);
                    abrirDialogo(e.final ? 'modal-final' : 'modal-win');
                    break;
                case 'derrota':
                    $('titulo-derrota').textContent = e.motivo === 'tiempo' ? 'TIEMPO AGOTADO' : 'DEFENSA COLAPSADA';
                    $('gameover-reason').textContent = e.motivo === 'tiempo' ? 'La misión terminó antes de alcanzar la meta. El planeta conserva el estado mostrado.' : 'El escudo se agotó y la Tierra recibió tres impactos directos.';
                    $('gameover-score').textContent = `Nivel ${s.nivel + 1} · ${s.puntos} / ${s.meta} meteoritos destruidos`;
                    sonido.musica('derrota', false);
                    abrirDialogo('modal-gameover');
                    break;
            }
        });
    }
    function frame(ahora) {
        const dt = (ahora - ultimoFrame) / 1000;
        ultimoFrame = ahora;
        // Una suspensión larga congela la misión; los frames lentos normales conservan el tiempo real.
        if (dt > 0.5) pausarPartida();
        if (pantallaActual === 'Seccion_Juego' && !$('Seccion_Juego').classList.contains('hidden')) {
            if (motor.estado === 'JUGANDO' && (movimiento.arriba || movimiento.abajo)) motor.moverNave(motor.nave.y + (Number(movimiento.abajo) - Number(movimiento.arriba)) * 900 * dt);
            motor.actualizar(dt);
            const s = motor.resumen();
            dibujar(s);
            atenderEventos(s);
        }
        requestAnimationFrame(frame);
    }
    // rotar no consume vida ni tiempo; reanudar requiere una acción del jugador.
    function suspenderPorAusencia() {
        pausarPartida();
        sonido.pausa();
        sonido.detenerVoz();
        if (!video.paused) video.pause();
    }
    function reanudarVista() {
        if (retrato.matches || document.hidden) return;
        if (pantallaActual === 'cinematica' && !cinematicaCerrada) reproducirCinematica();
        if (pantallaActual !== 'Seccion_Juego' || motor.estado !== 'PAUSA') sonido.reanudar();
    }
    window.addEventListener('blur', suspenderPorAusencia);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) suspenderPorAusencia();
        else reanudarVista();
    });
    window.addEventListener('focus', () => {
        reanudarVista();
    });
    retrato.addEventListener('change', () => {
        app.inert = retrato.matches;
        if (retrato.matches) suspenderPorAusencia();
        else reanudarVista();
    });
    app.inert = retrato.matches;
    sonido.onMusicaFin = clave => {
        if (clave === 'logro' && motor.estado === 'FINAL' && pantallaActual === 'Seccion_Juego') sonido.musica('ending');
    };
    app.dataset.pantalla = 'intro';
    posicionar($('tierra'), C.tierra.x, C.tierra.y);
    $('tierra').style.width = `${C.tierra.radio * 2 / C.mundo.ancho * 100}%`;
    $('tierra').style.height = `${C.tierra.radio * 2 / C.mundo.alto * 100}%`;
    $('nave').style.width = `${C.nave.ancho / C.mundo.ancho * 100}%`;
    $('nave').style.height = `${C.nave.alto / C.mundo.alto * 100}%`;
    renderizarComic();
    requestAnimationFrame(frame);
})();
