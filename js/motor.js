/* IRON FIST · Motor lógico. No usa DOM, audio, temporizadores ni Canvas. */
(function (raiz, crear) {
    const configuracion = typeof module === 'object' && module.exports
        ? require('./configuracion.js') : raiz.IF_CONFIG;
    const motor = crear(configuracion);
    if (typeof module === 'object' && module.exports) module.exports = motor;
    else raiz.IF_MOTOR = motor;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (configuracion) {
    'use strict';

    const limitar = (numero, minimo, maximo) => Math.max(minimo, Math.min(maximo, numero));
    const copiar = objeto => JSON.parse(JSON.stringify(objeto));

    // Intersección de un segmento con un círculo. Detecta también golpes entre dos frames.
    function fraccionColision(ax, ay, bx, by, radio) {
        const dx = bx - ax, dy = by - ay;
        const longitud = dx * dx + dy * dy;
        const distanciaInicial = ax * ax + ay * ay - radio * radio;
        if (distanciaInicial <= 0) return 0;
        if (longitud <= 1e-12) return null;
        const termino = 2 * (ax * dx + ay * dy);
        const discriminante = termino * termino - 4 * longitud * distanciaInicial;
        if (discriminante < 0) return null;
        const instante = (-termino - Math.sqrt(discriminante)) / (2 * longitud);
        return instante >= 0 && instante <= 1 ? instante : null;
    }

    class MotorCampana {
        constructor(config = configuracion, azar = Math.random) {
            this.config = config;
            this.azar = azar;
            this.estado = 'INACTIVO';
            this.nivel = 0;
            this.puntos = 0;
            this.tiempo = config.niveles[0].tiempo;
            this.cuenta = config.cuentaInicial;
            this.escudoCargas = config.tierra.cargas;
            this.vidas = config.tierra.vidas;
            this.nave = { x: config.nave.x, y: config.nave.y,
                ancho: config.nave.ancho, alto: config.nave.alto };
            this.meteoritos = [];
            this.proyectiles = [];
            this.motivoDerrota = '';
            this._eventos = [];
            this._secuencia = 0;
            this._oleada = 0;
            this._proximaOleada = 0;
            this._esperaDisparo = 0;
            this._estadoAntesPausa = '';
        }

        //  nueva partida = nivel 1 y reservas completas.
        nuevaCampana() {
            this._eventos = [];
            this.escudoCargas = this.config.tierra.cargas;
            this.vidas = this.config.tierra.vidas;
            this._secuencia = 0;
            this._oleada = 0;
            this.nave.y = this.config.nave.y;
            this._prepararNivel(0);
            return true;
        }

        reiniciarCampana() { return this.nuevaCampana(); }

        // el cambio de nivel no repone ni escudo ni vidas.
        siguienteNivel() {
            if (this.estado !== 'VICTORIA' || this.nivel >= this.config.niveles.length - 1) return false;
            this._prepararNivel(this.nivel + 1);
            return true;
        }

        _prepararNivel(indice) {
            this.nivel = indice;
            this.estado = 'CUENTA';
            this.puntos = 0;
            this.tiempo = this.config.niveles[indice].tiempo;
            this.cuenta = this.config.cuentaInicial;
            this.meteoritos = [];
            this.proyectiles = [];
            this._proximaOleada = 0;
            this._esperaDisparo = 0;
            this._estadoAntesPausa = '';
            this.motivoDerrota = '';
        }

        pausar() {
            if (!['CUENTA', 'JUGANDO'].includes(this.estado)) return false;
            this._estadoAntesPausa = this.estado;
            this.estado = 'PAUSA';
            return true;
        }

        reanudar() {
            if (this.estado !== 'PAUSA') return false;
            this.estado = this._estadoAntesPausa;
            this._estadoAntesPausa = '';
            return true;
        }

        salir() {
            this.estado = 'INACTIVO';
            this.meteoritos = [];
            this.proyectiles = [];
            this._eventos = [];
            this._estadoAntesPausa = '';
        }

        // misma geometría horizontal en PC y móvil; solo cambia la entrada.
        moverNave(yMundo) {
            if (!Number.isFinite(yMundo) || !['CUENTA', 'JUGANDO'].includes(this.estado)) return false;
            this.nave.y = limitar(yMundo, this.config.nave.minimoY, this.config.nave.maximoY);
            return true;
        }

        // una activación válida crea un puño. Mantener pulsado no dispara por sí solo.
        disparar() {
            const disparo = this.config.disparo;
            if (this.estado !== 'JUGANDO' || this._esperaDisparo > 1e-9
                || this.proyectiles.length >= disparo.maximoActivo) return false;
            const proyectil = { id: ++this._secuencia, x: this.nave.x - this.nave.ancho / 2,
                y: this.nave.y, radio: disparo.radio, velocidad: disparo.velocidad };
            this.proyectiles.push(proyectil);
            this._esperaDisparo = disparo.cadencia;
            this._emitir('disparo', proyectil);
            return true;
        }

        // El reloj y las colisiones avanzan con tiempo real. Subpasos evitan atravesar objetos.
        actualizar(dt) {
            if (!Number.isFinite(dt) || dt <= 0 || !['CUENTA', 'JUGANDO'].includes(this.estado)) return;
            let restante = dt;
            while (restante > 1e-9 && ['CUENTA', 'JUGANDO'].includes(this.estado)) {
                const paso = Math.min(restante, 1 / 60);
                this._paso(paso);
                restante -= paso;
            }
        }

        _paso(dt) {
            if (this.estado === 'CUENTA') {
                this.cuenta = Math.max(0, this.cuenta - dt);
                if (this.cuenta <= 1e-9) {
                    this.cuenta = 0;
                    this.estado = 'JUGANDO';
                    this._emitir('cuenta-finalizada', { nivel: this.nivel });
                    this._crearOleada();
                    this._proximaOleada = this._intervalo();
                }
                return;
            }

            this._esperaDisparo = Math.max(0, this._esperaDisparo - dt);
            // Guardamos el punto anterior para comprobar el recorrido completo del frame.
            this.meteoritos.forEach(m => {
                m.anteriorX = m.x;
                m.anteriorY = m.y;
                m.progreso = Math.min(1, m.progreso + dt / m.duracion);
                this._posicionarMeteorito(m);
                m.angulo += m.giro * dt;
            });
            this.proyectiles.forEach(p => {
                p.anteriorX = p.x;
                p.anteriorY = p.y;
                p.x -= p.velocidad * dt;
            });

            this._colisionesProyectiles();
            if (this.estado !== 'JUGANDO') return;
            this._colisionesTierra();
            if (this.estado !== 'JUGANDO') return;
            this.proyectiles = this.proyectiles.filter(p => p.x >= -p.radio);

            this.tiempo = Math.max(0, this.tiempo - dt);
            if (this.tiempo <= 1e-9) {
                this.tiempo = 0;
                this._perder('tiempo');
                return;
            }
            this._proximaOleada -= dt;
            if (this._proximaOleada <= 1e-9) {
                this._crearOleada();
                this._proximaOleada += this._intervalo();
            }
        }

        _aleatorio() {
            const numero = this.azar();
            return Number.isFinite(numero) ? limitar(numero, 0, 0.999999999) : 0.5;
        }

        _intervalo() {
            const nivel = this.config.niveles[this.nivel];
            return nivel.intervalo * (1 + (this._aleatorio() * 2 - 1) * nivel.variacionIntervalo);
        }

        // cada oleada respeta cantidad, resistencia y máximo activo.
        _crearOleada() {
            const nivel = this.config.niveles[this.nivel];
            const cantidadAzar = nivel.minimoOleada + Math.floor(this._aleatorio()
                * (nivel.maximoOleada - nivel.minimoOleada + 1));
            const faltantes = Math.max(0, nivel.meta - this.puntos - this.meteoritos.length);
            const cantidad = Math.min(cantidadAzar, nivel.maximoActivo - this.meteoritos.length, faltantes);
            if (cantidad <= 0) return;
            const numeroOleada = ++this._oleada;
            let resistenciaTotal = 0, grandes = 0;
            for (let i = 0; i < cantidad; i++) {
                const eleccion = this._aleatorio();
                let tipo = eleccion < nivel.pesos[0] ? 'pequeno'
                    : eleccion < nivel.pesos[0] + nivel.pesos[1] ? 'mediano' : 'grande';
                const reservaResto = cantidad - i - 1;
                let datos = this.config.tiposMeteorito[tipo];
                if ((tipo === 'grande' && grandes >= nivel.maximoGrandes)
                    || resistenciaTotal + datos.resistencia + reservaResto > nivel.maximoResistenciaOleada) {
                    tipo = 'pequeno';
                    datos = this.config.tiposMeteorito.pequeno;
                }
                resistenciaTotal += datos.resistencia;
                if (tipo === 'grande') grandes++;
                // Carriles separados: incluso cinco entradas dejan hueco entre sprites grandes.
                const inicioY = 120 + ((i + 0.5) / cantidad) * 660 + (this._aleatorio() * 2 - 1) * 14;
                const destinoY = this.config.tierra.y + (this._aleatorio() * 2 - 1) * 115;
                const m = {
                    id: ++this._secuencia, oleada: numeroOleada, tipo,
                    radio: datos.radio, resistencia: datos.resistencia, resistenciaInicial: datos.resistencia,
                    progreso: 0, inicioX: -datos.radio - 20, inicioY,
                    destinoX: this.config.tierra.x, destinoY,
                    duracion: nivel.recorrido / (0.84 + this._aleatorio() * 0.32),
                    amplitud: (this._aleatorio() < 0.65 ? 20 + this._aleatorio() * 38 : 0)
                        * (this._aleatorio() < 0.5 ? -1 : 1),
                    frecuencia: 1 + this._aleatorio() * 1.2,
                    angulo: this._aleatorio() * 360,
                    giro: (18 + this._aleatorio() * 32) * (this._aleatorio() < 0.5 ? -1 : 1)
                };
                this._posicionarMeteorito(m);
                this.meteoritos.push(m);
            }
        }

        //  diagonal hacia la Tierra + curva suave que desaparece en el punto de llegada.
        _posicionarMeteorito(m) {
            const progreso = m.progreso;
            const onda = Math.sin(progreso * Math.PI * m.frecuencia)
                * Math.sin(progreso * Math.PI) * m.amplitud;
            m.x = m.inicioX + (m.destinoX - m.inicioX) * progreso;
            m.y = limitar(m.inicioY + (m.destinoY - m.inicioY) * progreso + onda,
                105 + m.radio, this.config.mundo.alto - m.radio - 20);
        }

        // el puño se consume al golpear; un ID solo puntúa una vez.
        _colisionesProyectiles() {
            for (let i = this.proyectiles.length - 1; i >= 0; i--) {
                const p = this.proyectiles[i];
                let elegido = null, primeraFraccion = Infinity;
                for (const m of this.meteoritos) {
                    const fraccion = fraccionColision(p.anteriorX - m.anteriorX,
                        p.anteriorY - m.anteriorY, p.x - m.x, p.y - m.y, p.radio + m.radio);
                    const tierra = this.config.tierra;
                    const radioTierra = (this.escudoCargas > 0 ? tierra.radioEscudo : tierra.radio) + m.radio;
                    const impactoTierra = fraccionColision(m.anteriorX - tierra.x, m.anteriorY - tierra.y,
                        m.x - tierra.x, m.y - tierra.y, radioTierra);
                    // Un puño que llega después del impacto no puede deshacer el daño de ese frame.
                    if (impactoTierra !== null && (fraccion === null || impactoTierra <= fraccion)) continue;
                    if (fraccion !== null && fraccion < primeraFraccion) {
                        elegido = m;
                        primeraFraccion = fraccion;
                    }
                }
                if (!elegido) continue;
                this.proyectiles.splice(i, 1);
                elegido.resistencia--;
                this._emitir('golpe-meteorito', elegido);
                if (elegido.resistencia <= 0) {
                    this.meteoritos.splice(this.meteoritos.indexOf(elegido), 1);
                    this.puntos = Math.min(this.config.niveles[this.nivel].meta,
                        this.puntos + this.config.puntosPorMeteorito);
                    this._emitir('meteorito-destruido', elegido);
                    if (this.puntos >= this.config.niveles[this.nivel].meta) {
                        this.estado = this.nivel === this.config.niveles.length - 1 ? 'FINAL' : 'VICTORIA';
                        this.proyectiles = [];
                        this._emitir('victoria', { nivel: this.nivel, puntos: this.puntos,
                            tiempo: this.tiempo, final: this.estado === 'FINAL' });
                        return;
                    }
                }
            }
        }

        // la línea limita la nave; el daño solo ocurre contra el planeta o escudo.
        _colisionesTierra() {
            const tierra = this.config.tierra;
            for (let i = this.meteoritos.length - 1; i >= 0; i--) {
                const m = this.meteoritos[i];
                const radio = (this.escudoCargas > 0 ? tierra.radioEscudo : tierra.radio) + m.radio;
                const fraccion = fraccionColision(m.anteriorX - tierra.x, m.anteriorY - tierra.y,
                    m.x - tierra.x, m.y - tierra.y, radio);
                if (fraccion === null) continue;
                this.meteoritos.splice(i, 1);
                const impacto = { id: m.id, x: m.x, y: m.y, tipoMeteorito: m.tipo };
                if (this.escudoCargas > 0) {
                    this.escudoCargas--;
                    this._emitir('escudo-impacto', { ...impacto, escudoCargas: this.escudoCargas });
                    if (this.escudoCargas === 0) this._emitir('escudo-roto', impacto);
                } else {
                    this.vidas--;
                    this._emitir('tierra-impacto', { ...impacto, vidas: this.vidas });
                    if (this.vidas === 0) {
                        this._perder('destruccion');
                        return;
                    }
                }
            }
        }

        // causa de derrota independiente; tiempo agotado no destruye la imagen de Tierra.
        _perder(motivo) {
            if (this.estado !== 'JUGANDO') return;
            this.estado = 'DERROTA';
            this.motivoDerrota = motivo;
            this.proyectiles = [];
            this._emitir('derrota', { motivo, nivel: this.nivel, puntos: this.puntos,
                vidas: this.vidas, escudoCargas: this.escudoCargas });
        }

        _emitir(tipo, datos) {
            // Campo tipo queda reservado para el nombre de evento, no para el tamaño del meteorito.
            const { tipo: tipoMeteorito, ...detalle } = datos;
            this._eventos.push({ ...detalle, ...(tipoMeteorito ? { tipoMeteorito } : {}), tipo });
        }

        consumirEventos() {
            const eventos = this._eventos;
            this._eventos = [];
            return copiar(eventos);
        }

        resumen() {
            return copiar({ estado: this.estado, nivel: this.nivel,
                nombreNivel: this.config.niveles[this.nivel].nombre,
                meta: this.config.niveles[this.nivel].meta,
                puntos: this.puntos, tiempo: this.tiempo, cuenta: this.cuenta,
                escudoCargas: this.escudoCargas, vidas: this.vidas,
                danoTierra: this.config.tierra.vidas - this.vidas,
                motivoDerrota: this.motivoDerrota, nave: this.nave,
                meteoritos: this.meteoritos, proyectiles: this.proyectiles });
        }
    }

    return { MotorCampana };
}));
