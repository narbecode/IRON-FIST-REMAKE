/* IRON FIST · Audio con elementos Audio del navegador y recursos locales. */
(function (raiz, crear) {
    const api = crear();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else raiz.IF_AUDIO = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    class GestorAudio {
        constructor(configAudio, videoElement = null) {
            this.config = configAudio;
            this.video = videoElement;
            this.onVoz = null;
            this.onMusicaFin = null;
            this._activo = false;
            this._silenciado = false;
            this._pausado = false;
            this._musicas = new Map();
            this._voces = new Map();
            this._efectos = new Map();
            this._todos = new Set();
            this._audioMusica = null;
            this._claveMusica = null;
            this._finMusicaNotificado = false;
            this._audioVoz = null;
            this._indiceVoz = null;
            this._intencionVoz = 'detenida';
            this._versionMusica = 0;
            this._versionVoz = 0;
            this._secuenciaEfectos = 0;
            this._limpiarEventosVoz = null;
            if (this.video) this.video.muted = this._silenciado;
        }

        // El controlador llama a activar dentro de un clic o toque real del usuario.
        // No cambia canciones ni crea pistas de silencio para simular el desbloqueo.
        activar() {
            this._activo = true;
            if (!this._pausado) {
                this._reproducirMusica();
                if (this._intencionVoz === 'reproduciendo') this._reproducirVoz();
            }
            return true;
        }

        _crearAudio(ruta) {
            const audio = new Audio(ruta);
            audio.preload = 'auto';
            audio.muted = this._silenciado;
            // Mantiene los elementos de reproducción en una capa HTML sin controles visibles.
            if (typeof document !== 'undefined') {
                const capa = document.getElementById('audio-recursos');
                if (capa) capa.append(audio);
            }
            this._todos.add(audio);
            return audio;
        }

        _reiniciar(audio) {
            audio.pause();
            try { audio.currentTime = 0; } catch (_) { /* El recurso puede no tener metadatos todavía. */ }
        }

        // Un play puede resolverse después de salir de la pantalla. Solo continúa si aún es deseado.
        // Si la misma pista recibió una orden nueva válida, la orden antigua no la pausa por error.
        _playSeguro(audio, vigente, deseadoAhora, fallo = null) {
            try {
                const promesa = audio.play();
                if (promesa && typeof promesa.then === 'function') {
                    promesa.then(() => {
                        if (!vigente() && !deseadoAhora()) audio.pause();
                    }).catch(error => {
                        if (vigente() && fallo) fallo(error);
                    });
                }
            } catch (error) {
                if (vigente() && fallo) fallo(error);
            }
        }

        //  una sola música de fondo.
        // Historia y Reglas usan la misma clave y conservan la posición al cambiar de pantalla.
        musica(clave, loop = true) {
            const ruta = this.config.musica && this.config.musica[clave];
            if (!ruta) return false;
            if (this._claveMusica !== clave) {
                this._versionMusica++;
                if (this._audioMusica) this._reiniciar(this._audioMusica);
                if (!this._musicas.has(clave)) {
                    const audio = this._crearAudio(ruta);
                    audio.addEventListener('ended', () => this._notificarFinMusica(audio, clave));
                    this._musicas.set(clave, audio);
                }
                this._audioMusica = this._musicas.get(clave);
                this._claveMusica = clave;
                this._finMusicaNotificado = false;
                this._reiniciar(this._audioMusica);
            }
            this._audioMusica.loop = Boolean(loop);
            this._ajustarFondo();
            if (this._activo && !this._pausado && this._audioMusica.paused && !this._audioMusica.ended) {
                this._reproducirMusica();
            }
            return true;
        }

        // Permite enlazar logro con créditos cuando termina la pista actual, sin superponer fondos.
        _notificarFinMusica(audio, clave) {
            if (this._audioMusica !== audio || this._claveMusica !== clave || audio.loop
                || !audio.ended || this._finMusicaNotificado) return;
            this._finMusicaNotificado = true;
            if (typeof this.onMusicaFin === 'function') {
                try { this.onMusicaFin(clave); }
                catch (_) { /* La interfaz conserva su propia decisión sobre la pantalla siguiente. */ }
            }
        }

        _reproducirMusica() {
            const audio = this._audioMusica;
            if (!audio || !this._activo || this._pausado || audio.ended || !audio.paused) return;
            const version = ++this._versionMusica;
            const deseado = () => this._activo && !this._pausado && this._audioMusica === audio;
            this._playSeguro(audio, () => version === this._versionMusica && deseado(), deseado);
        }

        //  voz al 50 % y música constante, sin saltos de volumen entre escenas.
        // Pulsar otra vez la voz actual alterna pausa/reanudación sin perder su posición.
        voz(indice) {
            const ruta = this.config.voces && this.config.voces[indice];
            if (!Number.isInteger(indice) || !ruta) return false;
            if (this._indiceVoz === indice && this._audioVoz) {
                if (this._intencionVoz === 'reproduciendo') {
                    this._versionVoz++;
                    this._quitarEventosVoz();
                    this._audioVoz.pause();
                    this._intencionVoz = 'pausada';
                    this._ajustarFondo();
                    this._avisarVoz('pausada');
                } else {
                    this._intencionVoz = 'reproduciendo';
                    this._ajustarFondo();
                    this._reproducirVoz();
                }
                return true;
            }

            this.detenerVoz();
            if (!this._voces.has(indice)) this._voces.set(indice, this._crearAudio(ruta));
            this._audioVoz = this._voces.get(indice);
            this._indiceVoz = indice;
            this._reiniciar(this._audioVoz);
            this._audioVoz.volume = 0.50;
            this._intencionVoz = 'reproduciendo';
            this._ajustarFondo();
            this._reproducirVoz();
            return true;
        }

        _reproducirVoz() {
            const audio = this._audioVoz;
            if (!audio || this._intencionVoz !== 'reproduciendo') return;
            if (!this._activo || this._pausado) {
                this._avisarVoz('pausada');
                return;
            }
            if (!audio.paused && !audio.ended) return;
            const version = ++this._versionVoz;
            this._quitarEventosVoz();
            const deseado = () => this._activo && !this._pausado
                && this._audioVoz === audio && this._intencionVoz === 'reproduciendo';
            const vigente = () => version === this._versionVoz && deseado();
            const finalizar = () => {
                if (!vigente() || !audio.ended) return;
                this._terminarVoz('finalizada');
            };
            const error = () => {
                if (vigente()) this._terminarVoz('bloqueada');
            };
            audio.addEventListener('ended', finalizar);
            audio.addEventListener('error', error);
            this._limpiarEventosVoz = () => {
                audio.removeEventListener('ended', finalizar);
                audio.removeEventListener('error', error);
            };
            this._avisarVoz('reproduciendo');
            this._playSeguro(audio, vigente, deseado, error);
        }

        _quitarEventosVoz() {
            if (this._limpiarEventosVoz) this._limpiarEventosVoz();
            this._limpiarEventosVoz = null;
        }

        _terminarVoz(estado) {
            const indice = this._indiceVoz;
            this._versionVoz++;
            this._quitarEventosVoz();
            if (this._audioVoz) this._reiniciar(this._audioVoz);
            this._audioVoz = null;
            this._indiceVoz = null;
            this._intencionVoz = 'detenida';
            this._ajustarFondo();
            this._avisarVoz(estado, indice);
        }

        detenerVoz() {
            if (this._audioVoz || this._indiceVoz !== null) this._terminarVoz('detenida');
            else {
                this._versionVoz++;
                this._quitarEventosVoz();
                this._intencionVoz = 'detenida';
                this._ajustarFondo();
            }
        }

        _ajustarFondo() {
            if (this._audioMusica) this._audioMusica.volume = 0.42;
        }

        _avisarVoz(estado, indice = this._indiceVoz) {
            if (typeof this.onVoz !== 'function') return;
            try { this.onVoz(Object.freeze({ indice, estado, reproduciendo: estado === 'reproduciendo' })); }
            catch (_) { /* Un fallo de la interfaz no debe detener la gestión del audio. */ }
        }

        // hasta cuatro sonidos simultáneos de cada tipo.
        efecto(clave) {
            const ruta = this.config.efectos && this.config.efectos[clave];
            if (!ruta || !this._activo || this._pausado || this._silenciado) return false;
            if (!this._efectos.has(clave)) this._efectos.set(clave, []);
            const grupo = this._efectos.get(clave);
            let pista = grupo.find(p => !p.activa || p.audio.ended);
            if (!pista && grupo.length < 4) {
                pista = { audio: this._crearAudio(ruta), activa: false, version: 0, orden: 0 };
                pista.audio.volume = 0.70;
                pista.audio.loop = false;
                pista.audio.addEventListener('ended', () => {
                    if (pista.audio.ended) pista.activa = false;
                });
                pista.audio.addEventListener('error', () => { pista.activa = false; });
                grupo.push(pista);
            }
            if (!pista) pista = grupo.reduce((primera, actual) => actual.orden < primera.orden ? actual : primera);
            this._reiniciar(pista.audio);
            pista.activa = true;
            pista.orden = ++this._secuenciaEfectos;
            const version = ++pista.version;
            const deseado = () => this._activo && !this._pausado && pista.activa;
            const vigente = () => pista.version === version && deseado();
            this._playSeguro(pista.audio, vigente, deseado, () => { pista.activa = false; });
            return true;
        }

        _detenerEfectos() {
            this._efectos.forEach(grupo => grupo.forEach(pista => {
                pista.version++;
                pista.activa = false;
                this._reiniciar(pista.audio);
            }));
        }

        pausa() {
            if (this._pausado) return;
            this._pausado = true;
            this._versionMusica++;
            this._versionVoz++;
            this._quitarEventosVoz();
            if (this._audioMusica) this._audioMusica.pause();
            if (this._audioVoz) {
                this._audioVoz.pause();
                this._avisarVoz('pausada');
            }
            this._detenerEfectos();
            this._ajustarFondo();
        }

        reanudar() {
            if (!this._pausado) return;
            this._pausado = false;
            this._ajustarFondo();
            if (!this._activo) return;
            this._reproducirMusica();
            if (this._intencionVoz === 'reproduciendo') this._reproducirVoz();
        }

        silenciar(valor) {
            this._silenciado = Boolean(valor);
            this._todos.forEach(audio => { audio.muted = this._silenciado; });
            if (this.video) this.video.muted = this._silenciado;
        }

        detenerTodo() {
            this._versionMusica++;
            this.detenerVoz();
            if (this._audioMusica) this._reiniciar(this._audioMusica);
            this._audioMusica = null;
            this._claveMusica = null;
            this._detenerEfectos();
            this._pausado = false;
            // El controlador conserva el inicio/fin del video; aquí solo se corta su reproducción.
            if (this.video) this.video.pause();
        }

        resumen() {
            const vozReproduciendo = Boolean(this._audioVoz && this._intencionVoz === 'reproduciendo'
                && !this._pausado && !this._audioVoz.paused);
            const resumen = {
                activado: this._activo, silenciado: this._silenciado, pausado: this._pausado,
                musica: {
                    clave: this._claveMusica, reproduciendo: Boolean(this._audioMusica
                        && !this._audioMusica.paused), volumen: this._audioMusica ? this._audioMusica.volume : 0,
                    loop: Boolean(this._audioMusica && this._audioMusica.loop)
                },
                voz: {
                    indice: this._indiceVoz, estado: this._pausado && this._audioVoz
                        ? 'pausada' : this._intencionVoz, reproduciendo: vozReproduciendo
                },
                efectos: Object.fromEntries([...this._efectos].map(([clave, grupo]) =>
                    [clave, { creados: grupo.length, activos: grupo.filter(p => p.activa).length }])),
                videoSilenciado: this.video ? this.video.muted : null
            };
            Object.freeze(resumen.musica);
            Object.freeze(resumen.voz);
            Object.values(resumen.efectos).forEach(Object.freeze);
            Object.freeze(resumen.efectos);
            return Object.freeze(resumen);
        }
    }

    return { GestorAudio };
}));
