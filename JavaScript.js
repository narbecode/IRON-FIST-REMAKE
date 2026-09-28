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
        chapter: 'CAPÍTULO I: EL DESCUBRIMIENTO',
        caption: 'En cierto día, los observatorios astronómicos de todo el planeta detectaron una anomalía cósmica sin precedentes: una densa lluvia de meteoritos gigantescos en trayectoria directa de colisión contra la Tierra.'
    },
    {
        image: 'IMG/comic_02.jpg',
        chapter: 'CAPÍTULO I: LA ALERTA GLOBAL',
        caption: 'El resultado fue inmediato: las cadenas de noticias transmitieron la alarma roja. Miles de ciudadanos salieron a las calles exigiendo respuestas mientras el cielo comenzaba a teñirse de fuego y escombros.'
    },
    {
        image: 'IMG/comic_03.jpg',
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
const audioNarracion = new Audio("Narracion.mp3");

// ============================================================================
// 3. FUNCIÓN DE RENDERIZADO DEL CÓMIC (Sincroniza imagen, textos y botones)
// ============================================================================
function renderizarComic() {
    const panel = COMIC_PANELS[comicIndex];

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
        audioNarracion.pause();
        if (comicAudioIcon) comicAudioIcon.className = "fas fa-volume-high";

        // Regresa al menú principal
        control_visual(historia, menu);
    });
}

// Botón Narración por Voz (Play / Pause)
if (btnComicAudio) {
    btnComicAudio.addEventListener("click", () => {
        if (audioNarracion.paused) {
            audioNarracion.play();
            if (comicAudioIcon) comicAudioIcon.className = "fas fa-pause";
        } else {
            audioNarracion.pause();
            if (comicAudioIcon) comicAudioIcon.className = "fas fa-volume-high";
        }
    });
}

// Al terminar el audio por completo, restaura el icono automáticamente
audioNarracion.addEventListener("ended", () => {
    if (comicAudioIcon) comicAudioIcon.className = "fas fa-volume-high";
});

// Botón "JUGAR" al final del cómic (Pasa a las reglas o inicia el juego)
if (btnIniciarJuego) {
    btnIniciarJuego.addEventListener("click", () => {
        audioNarracion.pause();
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
});


Tiempo = 71 //VARIBLE DE INICIO TIEMPO
Puntaje = 0 //VARIABLE DE INICIO PUNTOS



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






// ============================================================================
// HALLAZGO 014 - Funciones generales parametrizadas para el control de meteoritos
// Antes existía una función "Metiorito_Direccion" / "Metiorito_Direccion2" y una
// "Explulsar" / "Explulsar2" (duplicadas para cada meteorito, y otra vez
// duplicadas dentro de DETENER_JUEGO al reanudar). Ahora una sola función
// recibe el id del elemento por parámetro y sirve para cualquier meteorito.
// ============================================================================

// Guarda la última distancia/altura de cada meteorito (para poder reposicionarlo al reanudar)
const estadoMeteoritos = {
    "Meteiorito": { distancia: 80, altura: 0 },
    "Meteiorito2": { distancia: 80, altura: 0 }
}

// Dirige el meteorito indicado hacia la Tierra desde una posición aleatoria
function moverMeteorito(idMeteorito) {
    const distancia = 80
    const altura = Math.round(Math.random() * 450)
    estadoMeteoritos[idMeteorito] = { distancia, altura }

    document.getElementById(idMeteorito).style.left = distancia + "%"
    document.getElementById(idMeteorito).style.top = altura + "px"
}

// Reubica el meteorito indicado en su última posición conocida (usado al reanudar tras una pausa)
function posicionarMeteoritoActual(idMeteorito) {
    const estado = estadoMeteoritos[idMeteorito]
    document.getElementById(idMeteorito).style.left = estado.distancia + "%"
    document.getElementById(idMeteorito).style.top = estado.altura + "px"
    document.getElementById(idMeteorito).style.transition = "2.4s"
}

// Expulsa el meteorito indicado fuera del mapa y reproduce su sonido de acierto
function expulsarMeteorito(idMeteorito, idSonido) {
    document.getElementById(idSonido).play()
    const altura = Math.round(Math.random() * 450)

    document.getElementById(idMeteorito).style.left = "-500px"
    document.getElementById(idMeteorito).style.top = altura + "px"
    document.getElementById(idMeteorito).style.transition = "1.8s"
}

// Envía el meteorito indicado fuera de pantalla de forma instantánea (derrota o fin de nivel)
function reiniciarPosicionMeteorito(idMeteorito) {
    document.getElementById(idMeteorito).style.left = "-70%"
    document.getElementById(idMeteorito).style.transition = "0s"
}

// Reinicia el contador de tiempo; si llega a 0 se pierde y ambos meteoritos vuelven a su posición inicial
function disminuirTiempo() {
    Tiempo--
    document.getElementById("Tiempo").innerHTML = Tiempo
    if (Tiempo == 0) {
        Tiempo = 71
        Puntaje = 0
        document.getElementById("Perdiste_sound").play()
        alert("Lo lamento perdiste")
        reiniciarPosicionMeteorito("Meteiorito")
        reiniciarPosicionMeteorito("Meteiorito2")
    } else {
        document.getElementById("Meteiorito").style.transition = "2.4s"
        document.getElementById("Meteiorito2").style.transition = "2.4s"
    }
}


//CONTENEDOR QUE CONTEIENE TOO EL JUEGO
//DE POR SI ESTA FUNCION NO SE EJECUTA HASTA QUE SE LA LLAMA, MAS ADELANTE LA LLAMAREMOS
//PARA QUE EL JUEGO INICIE UNA VEZ SE PRESIONE JUGAR
function JUEGO() {

    Restar_Tiempo = setInterval(disminuirTiempo, 1000)

    //AÑADIMOS LA FUNCION AUMENTAR PUNTOS AL PASAR EL CURSOR SOBRE LOS METIORITOS
    document.getElementById("Meteiorito").addEventListener('mouseover', Aumentar_Puntos)
    document.getElementById("Meteiorito2").addEventListener('mouseover', Aumentar_Puntos)


    //FUNCION QUE UNICAMENTE AUMENTA PUNTOS Y RESETEA LAS VARIABLES AL LLEGAR A CIERTO LIMITE
    function Aumentar_Puntos() {
        Puntaje++;
        document.getElementById("Puntaje").innerHTML = Puntaje + "&nbsp;/&nbsp;5"
        if (Puntaje == 5) {
            Puntaje = 0
            Tiempo = 71


            document.getElementById("NEXT").addEventListener('click', Habilitar_Siguienten_LVL)
            function Habilitar_Siguienten_LVL() {
                document.getElementById("NIVEL_01").style.display = "none"
                document.getElementById("NIVEL_02").style.display = "block"
            }
            document.getElementById("Tiempo").innerHTML = 70
            document.getElementById("Puntaje").innerHTML = 0 + "&nbsp;/&nbsp;" + 27
            document.getElementById("Triunfo").play()
            document.getElementById("Fondo_Ciberpunk").pause()
            document.getElementById("Puntos_sound").pause()
            document.getElementById("Punto2").pause()
            document.getElementById("GANASTE_PANTALLA").style.display = "flex"

            function Ganaste_Pantalla() {

                clearInterval(Reanudar_trayectoria)
                clearInterval(Reanudar_trayectoria2)
                clearInterval(Restar_Tiempo)

                reiniciarPosicionMeteorito("Meteiorito")
                reiniciarPosicionMeteorito("Meteiorito2")
            }

            Desbloquear_Pantalla = setInterval(Ganaste_Pantalla, 1)

            Swal.fire({
                title: 'FELICIDADES POR SUPERAR <br> EL NIVEL <br><br> <img src="IMG/Check.png" width = "120px"><br>',
                html: 'Al parecer nos salvamos, agradecemos tu ayuda y ezfuerzo al superar este nivel, esperamos seguir contando contigo, si algo mas sucede y por cierto, no olvides que te esperan grandes cosas al final del juego asi que no pares de intentar ',
                icon: 'success',
                confirmButtonText: 'QUIERO CONTINUAR',
                width: '50%',
                height: '80%',
                timer: 100000,


                timerProgressbar: true,
                /*Funcion de cerrar la alerta*/
                allowOutsideClick: true,
                allowEscapeKey: false,
                allowEnterkey: false,
                stopKeydownPropagation: false,
            }).then((resultado) => {
                //AL DAR CLICK EN "QUIERO CONTINUAR" PASAMOS DIRECTAMENTE AL SIGUIENTE NIVEL
                if (resultado.isConfirmed) {
                    Habilitar_Siguienten_LVL()
                    }
                });

        }
    }



    //DIRIGE A AMBOS METIORITOS A LA TIERRA CON LA MISMA FUNCION PARAMETRIZADA (Hallazgo 014)
    setTimeout(() => moverMeteorito("Meteiorito"), 2000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
    Reanudar_trayectoria = setInterval(() => moverMeteorito("Meteiorito"), 2430)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,4 SEGUNDOS

    setTimeout(() => moverMeteorito("Meteiorito2"), 2600)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
    Reanudar_trayectoria2 = setInterval(() => moverMeteorito("Meteiorito2"), 2350)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,3 SEGUNDOS


    //AQUI ADJUNTAMOS LA ACCION DE LA FUNCION EXPULSAR AL PASAR SOBRE EL METIORITO (Hallazgo 014)
    document.getElementById("Meteiorito").addEventListener('mouseover', () => expulsarMeteorito("Meteiorito", "Puntos_sound"))
    document.getElementById("Meteiorito2").addEventListener('mouseover', () => expulsarMeteorito("Meteiorito2", "Punto2"))





    //ESTA FUNCION SE ENCARGA DE ALERTARTE UNA VEZ EL METIORITO CRUZE LA LINEA CON UN PERDISTE
    //TAMBIEN RESETEA LOS VALORES Y LLEVA A LOS METIORITOS FUERA DEL MAPA DE MANERA INSTANTANEA
    function perdiste() {
        if ((document.getElementById("Meteiorito").offsetLeft > 630) ||
            (document.getElementById("Meteiorito2").offsetLeft > 630)) {

            document.getElementById("Perdiste_sound").play()
            alert("YA ES DEMASIADO TARDE, LOS METEORITOS DESTRUYERON GRAN PARTE DEL CONTINENTE Y LO MEJOR ES ESPERAR LO PEOR")
            reiniciarPosicionMeteorito("Meteiorito")
            reiniciarPosicionMeteorito("Meteiorito2")

            Tiempo = 71
            Puntaje = 0
        }

        else {
            document.getElementById("Meteiorito").style.transition = "2.4s"
            document.getElementById("Meteiorito2").style.transition = "2.4s"
        }
    }

    setInterval(perdiste, 1)//LE COLOCAMOS UNO PARA QUE SIEMPRE SE ESTE EJECUTANDO, DADO A 
    //QUE NO SABEMOS CUANDO EL METIORITO VA A SUPERAR EL LIMITE
}


//LE DECIMOS QUE AL PRECIONAR EL BOTON JUGAR EJECUTARA LA FUNCION PLAY     
document.getElementById("Play").addEventListener('click', PLAY)

Conteo = 4 //ESTE ES EL CONTEO DE LA CUENTA REGRESIVA QUE SE DA DESPUEZ DE PRESINAR JUGAR

//ESTA FUNCION EJECUTA UN CONJUNTO DE ACCIONES AL PRESIONAR JUGAR
function PLAY() {
    document.getElementById("Fondo_Ciberpunk").play()

    document.querySelector(".Contenedor").style.cursor = "url('IMG/cursor.png') 0 20, auto"

    //MUEVE EL TITULO FUERA DEL CONTENEDOR UNA VEZ DE CLICK A JUGAR
    document.getElementById("Texo").style.left = "-900px"
    //MUEVE AL BOTON PLAY TRANS PRESIONAR PRESIONAR AL MISMO BOTON
    document.getElementById("Contenedor_Mensaje_Star").style.left = "-100%"
    //ESTA FUNCION CONTIENE AL JUEGO COMO TAL
    function ARRACAR() {
        JUEGO()
    }
    //INVOCA AL JUEGO UNA VEZ PASEN 4 SEGUNDO - OSEA UNA VEZ TERMINE EL CONTADOR
    tiempo_de_arranque = setTimeout(ARRACAR, 4100)
    //ESTA FUNCION EJECUTA LA CUENTA REGRESIVA Y RETIRA LA PANTALLA START 
    function ESPERAR() {
        function Cuenta_rg() {
            Conteo--;
            document.getElementById("RGB").innerHTML = Conteo
            if (Conteo == -1) {
                document.getElementById("Contenedor_contador").style.display = "none"
                function Borrar() {
                    document.getElementById("Start").style.display = "none"

                    DETENER_JUEGO()
                }//HABILITA LA FUNCION DE PAUSE Y REANUDAR UNA VEZ CARGUE EL JUEGO
                setTimeout(Borrar, 500)
            }
        }
        setInterval(Cuenta_rg, 1000)
    }

    setTimeout(ESPERAR, 350)
}//SE EJECUTARA EN UN LAPSO DE 350, DESPUES DE PRESIONAR EL BOTON





//ESTA FUNCION CONTIENE EL REANUDE Y PAUSE DEL BOTON
function DETENER_JUEGO() {
    //INDICA QUE LA FUNCION DE PAUSE SE EJECUTARA UNA VEZ SE DE CLICK AL BOTON DE PAUSE        
    document.getElementById("Pause").addEventListener('click', PAUSE)
    //ESTA VARIABLE INDICA SI SE EJECUTA O NO EL DESPAUSEO
    Activo = 1
    //HACE QUE EL JUEGO SE DETENGA
    function PAUSE() { //Colocar la funcion de pausa y reanudar
        //SI LLEGA A UNA EJECUTA LA FUNCION PAUSE
        if (Activo == 1) {

            document.getElementById("Fondo_Ciberpunk").pause()
            document.getElementById("Pausa_Pantalla").style.display = "table"
            clearInterval(Restar_Tiempo)//BORRAMOS LA FUNCION DE TIEMPO
            document.getElementById("Tiempo").innerHTML = Tiempo
            clearInterval(Reanudar_trayectoria2)
            clearInterval(Reanudar_trayectoria)

            function Metiorito_detener() {
                document.getElementById("Meteiorito").style.left = document.getElementById("Meteiorito").offsetLeft + "px"
                document.getElementById("Meteiorito2").style.left = document.getElementById("Meteiorito2").offsetLeft + "px"

                document.getElementById("Meteiorito").style.top = document.getElementById("Meteiorito").offsetTop + "px"
                document.getElementById("Meteiorito2").style.top = document.getElementById("Meteiorito2").offsetTop + "px"
            }

            Pusae_offf = setInterval(Metiorito_detener, 1) //LE ASEGNAMOS UNA ID, PARA BORRALO UNA VEZ SE DESPAUSEE
            Activo = 2
        } //CAMBIAMOS EL VALOR PARA QUE AL VOLVER A DARLE CLICK EJECUTE LA CONDICIONAL DE REANUDAR

        else { //LA FUNCION DE REANUDAR
            clearInterval(Pusae_offf) //BORRAMOS LA FUNCION, PARA QUE EL REANUDAR PUEDA EJECUTARSE DE NUEVO
            document.getElementById("Pausa_Pantalla").style.display = "none"
            document.getElementById("Fondo_Ciberpunk").play()

            //REANUDAMOS EL CONTEO Y EL MOVIMIENTO REUTILIZANDO LAS MISMAS FUNCIONES GENERALES (Hallazgo 014)
            Restar_Tiempo = setInterval(disminuirTiempo, 1000)

            posicionarMeteoritoActual("Meteiorito")
            posicionarMeteoritoActual("Meteiorito2")

            setTimeout(() => moverMeteorito("Meteiorito"), 2000)
            Reanudar_trayectoria = setInterval(() => moverMeteorito("Meteiorito"), 2430)

            setTimeout(() => moverMeteorito("Meteiorito2"), 2000)
            Reanudar_trayectoria2 = setInterval(() => moverMeteorito("Meteiorito2"), 2350)

            Activo = 1
        }
    }
} //CAMBIAMOS EL VALOR DE NUEVO A 1 PARA QUE AL SIGUIENTE CLICK SE EJECUTE EL PAUSE  S









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