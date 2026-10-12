/* IRON FIST · Configuración. Valores compartidos por reglas, interfaz y motor. */
(function (raiz, crear) {
    const configuracion = crear();
    if (typeof module === 'object' && module.exports) module.exports = configuracion;
    else raiz.IF_CONFIG = configuracion;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    //  las reservas pertenecen a la campaña, no a cada nivel.
    const configuracion = {
        mundo: { ancho: 1600, alto: 900, fronteraX: 1248 },
        tierra: { x: 1504, y: 450, radio: 170, radioEscudo: 190, cargas: 3, vidas: 3 },
        nave: { x: 1328, y: 450, ancho: 90, alto: 68, minimoY: 150, maximoY: 800 },
        disparo: { velocidad: 1650, cadencia: 0.25, radio: 16, maximoActivo: 8 },
        cuentaInicial: 3,
        puntosPorMeteorito: 1,

        // tamaños, resistencia y dificultad declarados en una sola tabla.
        tiposMeteorito: {
            pequeno: { radio: 26, resistencia: 1 },
            mediano: { radio: 36, resistencia: 2 },
            grande: { radio: 49, resistencia: 3 }
        },
        niveles: [
            { nombre: 'FÁCIL', meta: 30, tiempo: 60, maximoActivo: 6,
                intervalo: 3.2, variacionIntervalo: 0.1, recorrido: 7.8,
                minimoOleada: 2, maximoOleada: 3, maximoResistenciaOleada: 5,
                maximoGrandes: 1, pesos: [0.60, 0.30, 0.10] },
            { nombre: 'MEDIO', meta: 30, tiempo: 60, maximoActivo: 8,
                intervalo: 3.0, variacionIntervalo: 0.1, recorrido: 4.8,
                minimoOleada: 2, maximoOleada: 4, maximoResistenciaOleada: 7,
                maximoGrandes: 1, pesos: [0.50, 0.35, 0.15] },
            { nombre: 'DIFÍCIL', meta: 30, tiempo: 60, maximoActivo: 9,
                intervalo: 3.3, variacionIntervalo: 0.1, recorrido: 4.0,
                minimoOleada: 3, maximoOleada: 4, maximoResistenciaOleada: 7,
                maximoGrandes: 1, pesos: [0.50, 0.35, 0.15] }
        ],

        // rutas activas.
        recursos: {
            imagenes: {
                menu: 'assets/imagenes/menu_pc.png',
                nave: 'assets/imagenes/nave_iron_fist.png',
                puno: 'assets/imagenes/puno_cinetico.png',
                meteoritos: {
                    pequeno: 'assets/imagenes/meteorito_pequeno.png',
                    mediano: 'assets/imagenes/meteorito_mediano.png',
                    grande: 'assets/imagenes/meteorito_grande.png'
                },
                tierra: ['assets/imagenes/tierra_normal.png', 'assets/imagenes/tierra_dano_1.png',
                    'assets/imagenes/tierra_dano_2.png', 'assets/imagenes/tierra_destruida.png']
            },
            audio: {
                musica: {
                    menu: 'assets/audio/musica/musica_menu.mp3',
                    historia: 'assets/audio/musica/musica_historia_reglas.mp3',
                    partida: 'assets/audio/musica/musica_partida.mp3',
                    logro: 'assets/audio/musica/musica_logro.mp3',
                    derrota: 'assets/audio/musica/musica_game_over.mp3',
                    ending: 'assets/audio/musica/musica_ending.mp3'
                },
                voces: ['assets/audio/voces/narracion_01.mp3', 'assets/audio/voces/narracion_02.mp3',
                    'assets/audio/voces/narracion_03.mp3'],
                efectos: {
                    disparo: 'assets/audio/efectos/fx_puno.mp3',
                    golpe: 'assets/audio/efectos/fx_meteorito_golpe.mp3',
                    explosion: 'assets/audio/efectos/fx_meteorito_explosion.mp3',
                    escudo: 'assets/audio/efectos/fx_escudo_impacto.mp3',
                    rotura: 'assets/audio/efectos/fx_escudo_rotura.mp3',
                    tierra: 'assets/audio/efectos/fx_tierra_impacto.mp3'
                }
            },
            video: { intro: 'assets/video/intro_cinematica_iron_fist.mp4' }
        },
        equipo: ['Ángel Jesús Narva Benites', 'Brendy Mariali Sihuincha Bautista',
            'Sheyla Nayeli Ticona Chacon', 'Andy Ismael Napan Vega']
    };

    // Impide que una pantalla cambie por accidente los valores usados por las otras.
    function fijar(objeto) {
        Object.values(objeto).forEach(valor => {
            if (valor && typeof valor === 'object') fijar(valor);
        });
        return Object.freeze(objeto);
    }
    return fijar(configuracion);
}));
