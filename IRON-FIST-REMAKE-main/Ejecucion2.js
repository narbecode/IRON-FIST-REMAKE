Tiempolvl2 = 61 //VARIBLE DE INICIO TIEMPO
Puntajelvl2 = 0 //VARIABLE DE INICIO PUNTOS





// ============================================================================
// HALLAZGO 014 - Funciones generales parametrizadas para el control de meteoritos (Nivel 2)
// Reemplazan a Metiorito_Direccionlvl2 / 2lvl2 / 3lvl2, Explulsarlvl2 / 2lvl2 / 3lvl2
// y su segunda copia dentro de DETENER_JUEGOlvl2 al reanudar.
// ============================================================================

const estadoMeteoritoslvl2 = {
    "Meteioritolvl2": { distancia: 80, altura: 0 },
    "Meteiorito2lvl2": { distancia: 80, altura: 0 },
    "Meteiorito3lvl2": { distancia: 80, altura: 0 }
}

// Dirige el meteorito indicado hacia la Tierra desde una posición aleatoria
function moverMeteoritolvl2(idMeteorito) {
    const distancia = 80
    const altura = Math.round(Math.random() * 450)
    estadoMeteoritoslvl2[idMeteorito] = { distancia, altura }

    document.getElementById(idMeteorito).style.left = distancia + "%"
    document.getElementById(idMeteorito).style.top = altura + "px"
}

// Reubica el meteorito indicado en su última posición conocida (usado al reanudar tras una pausa)
function posicionarMeteoritoActuallvl2(idMeteorito) {
    const estado = estadoMeteoritoslvl2[idMeteorito]
    document.getElementById(idMeteorito).style.left = estado.distancia + "%"
    document.getElementById(idMeteorito).style.top = estado.altura + "px"
    document.getElementById(idMeteorito).style.transition = "2s"
}

// Expulsa el meteorito indicado fuera del mapa y reproduce su sonido de acierto
function expulsarMeteoritolvl2(idMeteorito, idSonido) {
    document.getElementById(idSonido).play()
    const altura = Math.round(Math.random() * 450)

    document.getElementById(idMeteorito).style.left = "-500px"
    document.getElementById(idMeteorito).style.top = altura + "px"
    document.getElementById(idMeteorito).style.transition = "1.8s"
}

// Envía el meteorito indicado fuera de pantalla de forma instantánea (derrota o fin de nivel)
function reiniciarPosicionMeteoritolvl2(idMeteorito) {
    document.getElementById(idMeteorito).style.left = "-70%"
    document.getElementById(idMeteorito).style.transition = "0s"
}

// Reinicia el contador de tiempo; si llega a 0 se pierde y los tres meteoritos vuelven a su posición inicial
function disminuirTiempolvl2() {
    Tiempolvl2--
    document.getElementById("Tiempolvl2").innerHTML = Tiempolvl2
    if (Tiempolvl2 == 0) {
        Tiempolvl2 = 61
        Puntajelvl2 = 0
        alert("El tiempo se agotó, lo lamento, de seguro lo lograrás para la siguiente")
    }
}


//CONTENEDOR QUE CONTEIENE TOO EL JUEGO
//DE POR SI ESTA FUNCION NO SE EJECUTA HASTA QUE SE LA LLAMA, MAS ADELANTE LA LLAMAREMOS
//PARA QUE EL JUEGO INICIE UNA VEZ SE PRESIONE JUGAR
function JUEGOlvl2(){

        Restar_Tiempolvl2 = setInterval(disminuirTiempolvl2, 1000)

        //AÑADIMOS LA FUNCION AUMENTAR PUNTOS AL PASAR EL CURSOR SOBRE LOS METIORITOS
        document.getElementById("Meteioritolvl2").addEventListener('mouseover', Aumentar_Puntoslvl2)
        document.getElementById("Meteiorito2lvl2").addEventListener('mouseover', Aumentar_Puntoslvl2)
        document.getElementById("Meteiorito3lvl2").addEventListener('mouseover', Aumentar_Puntoslvl2)


        //FUNCION QUE UNICAMENTE AUMENTA PUNTOS Y RESETEA LAS VARIABLES AL LLEGAR A CIERTO LIMITE
        function Aumentar_Puntoslvl2(){
            Puntajelvl2++;
            document.getElementById("Puntajelvl2").innerHTML = Puntajelvl2 + " / 4"
            if(Puntajelvl2 == 2){
                Puntajelvl2 = 0 
                Tiempolvl2 = 61

                document.getElementById("Tiempolvl2").innerHTML = 60
                document.getElementById("Puntajelvl2").innerHTML = 0+"&nbsp;/&nbsp;"+34
                document.getElementById("Fondo_Ciberpunk").pause()
                document.getElementById("Triunfo").play()
                const nextBtn = document.getElementById("NEXT");
                if (nextBtn) {
                    nextBtn.removeAttribute("disabled");
                    nextBtn.classList.remove("disabled");
                    nextBtn.setAttribute("aria-disabled", "false");
                    nextBtn.addEventListener('click', Habilitar_Siguienten_LVL);
                }
                function Habilitar_Siguienten_LVL(){
                    document.getElementById("NIVEL_01").style.display = "none";
                    document.getElementById("NIVEL_02").style.display = "none";
                    document.getElementById("NIVEL3").style.display = "flex";
                    if (nextBtn) {
                        nextBtn.setAttribute("disabled", "true");
                        nextBtn.classList.add("disabled");
                        nextBtn.setAttribute("aria-disabled", "true");
                        nextBtn.style.display = "none";
                    }
                }
                            
                function Ganaste_Pantallalvl2(){

                    clearInterval(Reanudar_trayectorialvl2)
                    clearTimeout(Activador_iniciallvl2)
                    clearInterval(Reanudar_trayectoria2lvl2)
                    clearTimeout(Activador_inicial2lvl2)
                    clearInterval(Reanudar_trayectoria3lvl2)
                    clearTimeout(Activador_inicial3lvl2) 
                    clearInterval(Restar_Tiempolvl2) 

                    reiniciarPosicionMeteoritolvl2("Meteioritolvl2")
                    reiniciarPosicionMeteoritolvl2("Meteiorito2lvl2")
                    reiniciarPosicionMeteoritolvl2("Meteiorito3lvl2")}

                     setInterval(Ganaste_Pantallalvl2, 1)


                document.getElementById("GanastePantallaLvL2").style.display = "flex"
                Swal.fire({
                    title : 'FELICIDADES POR SUPERAR <br> EL NIVEL <br><br> <img src="IMG/Check.png" width = "120px"><br>',
                    html: '¿VERDAD QUE FUE DIFÍCIL?. Prepárate para el siguiente nivel que las cosas van a empeorar. Agradecemos tu dedicación en pasar este nivel, esperemos que puedas seguir defendiendo la tierra de esa manera y mejores tu habilidad de reacción ',
                    icon: 'sucess',
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


        //DIRIGE A LOS TRES METIORITOS A LA TIERRA CON LA MISMA FUNCION PARAMETRIZADA (Hallazgo 014)
        Activador_iniciallvl2 = setTimeout(() => moverMeteoritolvl2("Meteioritolvl2"), 3500)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
        Reanudar_trayectorialvl2 = setInterval(() => moverMeteoritolvl2("Meteioritolvl2"), 2030)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,4 SEGUNDOS

        Activador_inicial2lvl2 = setTimeout(() => moverMeteoritolvl2("Meteiorito2lvl2"), 3000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
        Reanudar_trayectoria2lvl2 = setInterval(() => moverMeteoritolvl2("Meteiorito2lvl2"), 2750)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,3 SEGUNDOS

        Activador_inicial3lvl2 = setTimeout(() => moverMeteoritolvl2("Meteiorito3lvl2"), 2200)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
        Reanudar_trayectoria3lvl2 = setInterval(() => moverMeteoritolvl2("Meteiorito3lvl2"), 2470)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,3 SEGUNDOS


        //AQUI ADJUNTAMOS LA ACCION DE LA FUNCION EXPULSAR AL PASAR SOBRE EL METIORITO (Hallazgo 014)
        document.getElementById("Meteioritolvl2").addEventListener('mouseover', () => expulsarMeteoritolvl2("Meteioritolvl2", "Puntos_sound"))
        document.getElementById("Meteiorito2lvl2").addEventListener('mouseover', () => expulsarMeteoritolvl2("Meteiorito2lvl2", "Punto2"))
        document.getElementById("Meteiorito3lvl2").addEventListener('mouseover', () => expulsarMeteoritolvl2("Meteiorito3lvl2", "Punto3"))




        
        //ESTA FUNCION SE ENCARGA DE ALERTARTE UNA VEZ EL METIORITO CRUZE LA LINEA CON UN PERDISTE
        //TAMBIEN RESETEA LOS VALORES Y LLEVA A LOS METIORITOS FUERA DEL MAPA DE MANERA INSTANTANEA
        function perdistelvl2 (){
            if((document.getElementById("Meteioritolvl2").offsetLeft > 630) ||
            (document.getElementById("Meteiorito2lvl2").offsetLeft > 630) ||
            (document.getElementById("Meteiorito3lvl2").offsetLeft > 630))
            
            {
                document.getElementById("Perdiste_sound").play()
            
                alert("YA ES DEMASIADO TARDE, LOS METEORITOS DESTRUYERON GRAN PARTE DEL CONTINENTE Y LO MEJOR ES ESPERAR LO PEOR")

                reiniciarPosicionMeteoritolvl2("Meteioritolvl2")
                reiniciarPosicionMeteoritolvl2("Meteiorito2lvl2")
                reiniciarPosicionMeteoritolvl2("Meteiorito3lvl2")

                Tiempolvl2 = 61
                Puntajelvl2 = 0 }
        
            else {
                document.getElementById("Meteioritolvl2").style.transition = "2s"
                document.getElementById("Meteiorito2lvl2").style.transition = "2s"
                document.getElementById("Meteiorito3lvl2").style.transition = "2s"           
            } }

        setInterval(perdistelvl2, 1)//LE COLOCAMOS UNO PARA QUE SIEMPRE SE ESTE EJECUTANDO, DADO A 
        //QUE NO SABEMOS CUANDO EL METIORITO VA A SUPERAR EL LIMITE
        }

        
        //LE DECIMOS QUE AL PRECIONAR EL BOTON JUGAR EJECUTARA LA FUNCION PLAY     
        document.getElementById("Playlvl2").addEventListener('click', PLAYlvl2)

        Conteolvl2 = 4 //ESTE ES EL CONTEO DE LA CUENTA REGRESIVA QUE SE DA DESPUEZ DE PRESINAR JUGAR
            
            //ESTA FUNCION EJECUTA UN CONJUNTO DE ACCIONES AL PRESIONAR JUGAR
            function PLAYlvl2(){
                document.getElementById("Fondo_Ciberpunk").play()

                document.querySelector(".Contenedorlvl2").style.cursor = "url('IMG/cursor.png') 0 20, auto"

                //MUEVE EL TITULO FUERA DEL CONTENEDOR UNA VEZ DE CLICK A JUGAR
                document.getElementById("Texolvl2").style.left = "-900px" 
                //MUEVE AL BOTON PLAY TRANS PRESIONAR PRESIONAR AL MISMO BOTON
                document.getElementById("Playlvl2").style.left = "-900px" 
                document.getElementById("Dificultad").style.left = "-900px"
                    //ESTA FUNCION CONTIENE AL JUEGO COMO TAL
                    function ARRACARlvl2(){    
                        JUEGOlvl2()}
                //INVOCA AL JUEGO UNA VEZ PASEN 4 SEGUNDO - OSEA UNA VEZ TERMINE EL CONTADOR
                tiempo_de_arranquelvl2 =  setTimeout(ARRACARlvl2, 4100)
                //ESTA FUNCION EJECUTA LA CUENTA REGRESIVA Y RETIRA LA PANTALLA START 
                function ESPERARlvl2(){
                    function Cuenta_rglvl2(){
                        Conteolvl2--;
                        document.getElementById("RGBlvl2").innerHTML = Conteolvl2
                        if(Conteolvl2 == -1){
                        document.getElementById("Contenedor_contadorlvl2").style.display = "none"
                        function Borrarlvl2(){
                        document.getElementById("Startlvl2").style.display = "none"

                            DETENER_JUEGOlvl2() }//HABILITA LA FUNCION DE PAUSE Y REANUDAR UNA VEZ CARGUE EL JUEGO
                        setTimeout(Borrarlvl2, 500) }  }
                        setInterval (Cuenta_rglvl2, 1000)}

                        setTimeout(ESPERARlvl2, 350)}//SE EJECUTARA EN UN LAPSO DE 350, DESPUES DE PRESIONAR EL BOTON


            //ESTA FUNCION CONTIENE EL REANUDE Y PAUSE DEL BOTON
            function DETENER_JUEGOlvl2 (){
                //INDICA QUE LA FUNCION DE PAUSE SE EJECUTARA UNA VEZ SE DE CLICK AL BOTON DE PAUSE        
                document.getElementById("Pauselvl2").addEventListener('click', PAUSElvl2)
                //ESTA VARIABLE INDICA SI SE EJECUTA O NO EL DESPAUSEO
                Activolvl2 = 1 
                    //HACE QUE EL JUEGO SE DETENGA
                    function PAUSElvl2(){
                        //SI LLEGA A UNA EJECUTA LA FUNCION PAUSE
                        if (Activolvl2 == 1){
                        document.getElementById("Pausa_Pantallalvl2").style.display = "table"
                        document.getElementById("Fondo_Ciberpunk").pause()
                        clearInterval(Restar_Tiempolvl2)//BORRAMOS LA FUNCION DE TIEMPO
                        document.getElementById("Tiempolvl2").innerHTML = Tiempolvl2
                            clearInterval(Reanudar_trayectorialvl2)
                            clearInterval(Reanudar_trayectoria2lvl2)
                            clearInterval(Reanudar_trayectoria3lvl2)

                            function Metiorito_detenerlvl2 (){   
                            document.getElementById("Meteioritolvl2").style.left = document.getElementById("Meteioritolvl2").offsetLeft + "px" 
                            document.getElementById("Meteiorito2lvl2").style.left = document.getElementById("Meteiorito2lvl2").offsetLeft + "px" 
                            document.getElementById("Meteiorito3lvl2").style.left = document.getElementById("Meteiorito3lvl2").offsetLeft + "px" 

                            document.getElementById("Meteioritolvl2").style.top = document.getElementById("Meteioritolvl2").offsetTop + "px" 
                            document.getElementById("Meteiorito2lvl2").style.top = document.getElementById("Meteiorito2lvl2").offsetTop + "px" 
                            document.getElementById("Meteiorito3lvl2").style.top = document.getElementById("Meteiorito3lvl2").offsetTop + "px" }

                            Pusae_offflvl2 = setInterval(Metiorito_detenerlvl2, 0.01) //LE ASEGNAMOS UNA ID, PARA BORRALO UNA VEZ SE DESPAUSEE
                            Activolvl2 = 2} //CAMBIAMOS EL VALOR PARA QUE AL VOLVER A DARLE CLICK EJECUTE LA CONDICIONAL DE REANUDAR

                        else { //LA FUNCION DE REANUDAR
                            clearInterval(Pusae_offflvl2) 
                            document.getElementById("Pausa_Pantallalvl2").style.display = "none"
                            document.getElementById("Fondo_Ciberpunk").play()

                            //REANUDAMOS EL CONTEO Y EL MOVIMIENTO REUTILIZANDO LAS MISMAS FUNCIONES GENERALES (Hallazgo 014)
                            Restar_Tiempolvl2 = setInterval(disminuirTiempolvl2, 1000)

                            posicionarMeteoritoActuallvl2("Meteioritolvl2")
                            posicionarMeteoritoActuallvl2("Meteiorito2lvl2")
                            posicionarMeteoritoActuallvl2("Meteiorito3lvl2")

                            setTimeout(() => moverMeteoritolvl2("Meteioritolvl2"), 1700)
                            Reanudar_trayectorialvl2 = setInterval(() => moverMeteoritolvl2("Meteioritolvl2"), 2430)

                            setTimeout(() => moverMeteoritolvl2("Meteiorito2lvl2"), 1)
                            Reanudar_trayectoria2lvl2 = setInterval(() => moverMeteoritolvl2("Meteiorito2lvl2"), 2050)

                            setTimeout(() => moverMeteoritolvl2("Meteiorito3lvl2"), 1700)
                            Reanudar_trayectoria3lvl2 = setInterval(() => moverMeteoritolvl2("Meteiorito3lvl2"), 2570)

                        Activolvl2 = 1 } } }