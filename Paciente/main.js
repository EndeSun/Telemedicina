// Variable global del websocket.
var conexion = "";


// Para cambiar la sección a la interfaz para elegir el paciente a quién quiere compartir.
var idMuestraCompartir = "";
function compartir(id) {
    // Así obtenemos el id de la muestra a compartir.
    idMuestraCompartir = id;
    cambiarSeccion("compartir");
}


// Para los diferentes botones que elije el paciente para compartir.
// Para el caso en el que el paciente quiera compartir a una persona en concreta.
var pacienteElegir = document.getElementById("someone");
pacienteElegir.addEventListener("click", function () {
    // Cuando hace click en esta opción
    var electionPaciente = document.getElementById("elegirPacientes");
    electionPaciente.innerHTML = "";
    // Obtenemos la referencia a donde vamos a imprimir toda la lista de pacientes y lo vacíamos primero.
    for (var i in pacientesDelMedico) {
        // Pacientes del médico es una variable global donde guardamos la lista de pacientes.

        // Si el nombre es igual al propio pacientes que no se imprima.
        if (pacientesDelMedico[i].nombre != pac.nombre) {
            electionPaciente.innerHTML += "<li><input type='radio' id=" + pacientesDelMedico[i].id + " name='compartirQuien' value=" + pacientesDelMedico[i].nombre + ">" + pacientesDelMedico[i].nombre + "</li>"
        }

        // Si el médico del paciente no tiene a ningún paciente más, pues que se imprima por pantalla la cadena de texto siguiente.
        // if (electionPaciente.innerHTML == '') {
        //     electionPaciente.innerHTML += "Tú médico solo te tiene a ti😊";
        // }
    }
})


// Si el paciente elije la opción de compartir con todos, hay que vaciar la lista de pacientes.
var pacienteElegir2 = document.getElementById("all");
pacienteElegir2.addEventListener("click", function () {
    var electionPaciente = document.getElementById("elegirPacientes");
    electionPaciente.innerHTML = "";
})

// Lo mismo ocurre que cuando el paciente elija compartir a su médico
var pacienteElegir3 = document.getElementById("medico");
pacienteElegir3.addEventListener("click", function () {
    var electionPaciente = document.getElementById("elegirPacientes");
    electionPaciente.innerHTML = "";
})





//Donde se manda los mensajes al servidor.
// Botón de compartir Muestra
function compartirMuestra() {
    // election obtiene referencia al option que ha escojido el paciente.
    var election = document.querySelector('input[name=compartirQuien]:checked');
    // En el caso de que no escoja ninguna opción o siga seleccionado en la opción de selecciona a un solo paciente.
    if (election == null || election.value == "someone") {
        alert("Elija una opción por favor.");
    } else {

        var election = election.value //Obtenemos el valor del radio seleccionado
        var electionID = document.querySelector('input[name=compartirQuien]:checked').id;
        //Los valores de radio son: medico; all o id del paciente que ha seleccionado;
        // Le envia:
        // operación 2 de paciente
        // El nombre del paciente que comparte la muestra
        // El id del paciente que comparte la muestra
        // El médico del paciente que comparte la muestra
        // El id de la persona a la que quiere compartir
        // El id de la muestra que quiere compartir.
        conexion.send(JSON.stringify({ origen: "paciente2", nombrePaciente: pac.nombre, idPaciente: pac.id, medico: pac.medico, idPersonaCompartir: electionID, personaCompartir: election, idMuestraCompartir: idMuestraCompartir }));
    }
}

// Cuando volvemos de la interfaz de compartir muestra.
function volverDeCompartir() {
    cambiarSeccion('menu-principal-paciente');
    // Para deseleccionar la opción
    document.querySelectorAll('[name=compartirQuien]').forEach((x) => x.checked = false);

    // Obtenemos la referencia a los pacientes que tiene ese médico y lo vacíamos.
    var electionPaciente = document.getElementById("elegirPacientes");
    electionPaciente.innerHTML = "";
}






// //////////////////////////////////////////////////////////////////////////
// // Función síncrona:
// function calcularCostoTratamiento(sip){
//     var tratamientos = obtenerTratamiento(sip);
//     console.log("Tratamiento detectado", tratamientos.length); //10s
//     var costo = 0;
//     for(var i = 0; i<tratamientos.length;i++){
//         costo += obtenerTratamiento(tratamiento[i]); //2s
//     }
//     return costo;
// }
// var c = calcularCostoTratamiento("31324131"); //20s
// console.log("El costo para el tratamiento es: ",c);

// // Ejemplo de función asíncrona
// function calcularCostoTratamiento(sip, callback){
//     obtenerTratamiento(sip, function(tratamiento){
//         console.log("Tratamientos detectados:",tratamientos.length);
//         for(var i = 0; i < tratamiento.length;i++){
//             obtenerTratamiento(tratamientos[i], function(costoTr){
//                 console.log("Costo Tratamiento", costoTr);
//                 costo+=costoTr;
//                 finalizados++;
//                 if(finalizados == tratamiento.length){
//                     callback(costo);
//                 }
//             })
//         }
//     })
// }


////////////////////////////////////////////////////////////////////////////

// Obtenemos una referencia a la aplicación RPC del servidor
var app = rpc("localhost", "MiGestionPacientes")

var login = app.procedure("login");
var listadoVariables = app.procedure("listadoVariables");
var datosMedico = app.procedure("datosMedico");
var listadoMuestras = app.procedure("listadoMuestras");
var agregarMuestra = app.procedure("agregarMuestra");
var eliminarMuestra = app.procedure("eliminarMuestra");
var incrementar = app.procedure("incrementar")
















//Creamos una variable global de idPaciente para poder utilizarlo luego para añadir las muestras de los pacientes.
var idPac = "";
// Para cambiar las interfaces en el paciente.
var seccionActual = "loginPac";
function cambiarSeccion(seccion) {
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual = seccion;
}













// Función para mostrar los nombres de las variables que tiene el paciente
// Función 2 del servidor
// Es una función asíncrona, es decir, se ejecuta en paralelo. Obtengo estas variables al principio.
nombreVariables = [];
listadoVariables(function (variables) {
    nombreVariables = variables;
})








// Creamos las variables globales de med y pac para poder hacer la asincronía
var med = null;
var pac = null;
var pacientesDelMedico = [];
// Primera funcionalidad de la interfaz
// Función de entrar a la interfaz principal del paciente.
function entrar() {
    // Obtenemos la referencia del código de acceso que introduce el paciente.
    var entry = document.getElementById("accessCode").value;
    // Ya se obtiene información de la interfaz del menú principal del paciente.
    var welc = document.getElementById("welcomeMessage");
    // Filtrado es el select donde se va a filtrar las variables según el tipo de muestra
    var filtrado = document.getElementById("filtradoVariables");
    // Por defecto el filtrado es el primer valor (el deshabilitado).
    filtrado.value = filtrado[0].value;
    welc.innerHTML = "";

    // Función 1 del servidor
    // Entry es el la variable que paso cómo parámetro, login solo tiene un parámetro.
    // Paciente es el valor de retorno de la función login.
    login(entry, function (paciente) {
        // La función de login devuelve null si no encuentra ningún código de acceso, si encuentra el código de acceso, devuelve el objeto paciente con ese código de acceso
        if (paciente == null) {
            alert("No se ha encontrado ningún paciente con dicho código de acceso")
            document.getElementById("accessCode").value = ''; //Borrar el campo si la contraseña está mal.
            document.getElementById("accessCode").focus();
        }
        else {

            // Parte de websockets
            conexion = new WebSocket('ws://localhost:4444', "pacientes"); //Pacientes es el protocolo, tiene que coincidir.
            // Este callback se lanza cuando el cliente se conecta.
            conexion.addEventListener('open', function (event) {
                cambiarSeccion("menu-principal-paciente");
                pac = paciente;
                idPac = paciente.id;

                // Enviamos mensaje al servidor websocket para obtener la lista de pacientes
                // Le enviamos:
                // Operación 1 del paciente para obtener la lista de pacientes del médico
                // Médico del paciente para buscar los pacientes que tengan los mismos médicos.
                // El id del paciente para identificar a esta conexión.
                conexion.send(JSON.stringify({ origen: "paciente1", medicoPacienteConectado: pac.medico, idPac: idPac }));

                welc.innerHTML += "Bienvenido/a " + paciente.nombre + "!!!";
                //Empiezan a ejecutarse.
                adivinarMedico(paciente.medico);
                mostrarMuestras(paciente.id);

            });


            // Se lanza cuando un cliente manda un mensaje.
            conexion.addEventListener('message', function (event) {
                // Aquí se obtienen todos los mensajes del servidor socket.
                // console.log("Mensaje del servidor:", event.data);
                // Tengo que identificar que tipo de mensaje es porque le van a llegar más de dos mensajes también aquí.
                var msg = JSON.parse(event.data);
                // Cuando entra por primera vez para que le devuelvan los pacientes.
                if (msg.contenido == "listaPaciente") {
                    pacientesDelMedico = msg.listaP;
                }
                // Cuando comparte el paciente a los otros pacientes.
                else if (msg.contenido == "mensaje") {
                    alert(msg.mensaje);
                }

                else if (msg.contenido == "mensajeError") {
                    alert(msg.mensaje);
                }

                else if (msg.contenido == "mensajeCorrecto") {
                    alert(msg.mensaje);
                }


            });
        }
    });
}


// Función implementada del examen, que es aumentar todos los valores de las muestras en 1.
function incrementarButton() {
    incrementar(pac.id, function (muestras) {
        refrescarPagina();
    })
}

// Cunadon hacemos un cambio, y queremos refrescar la página lo hacemos con esta función y no la de entrar, sino se va conectando cada vez que llamamos a la función de entrar.
function refrescarPagina() {
    // Ya se obtiene información de la interfaz del menú principal del paciente.
    var welc = document.getElementById("welcomeMessage");
    // Filtrado es el select donde se va a filtrar las variables según el tipo de muestra
    var filtrado = document.getElementById("filtradoVariables");
    // Por defecto el filtrado es el primer valor (el deshabilitado).
    filtrado.value = filtrado[0].value;
    welc.innerHTML = "";
    cambiarSeccion("menu-principal-paciente");


    // Enviamos mensaje al servidor websocket para obtener la lista de pacientes
    // Le enviamos:
    // Operación 1 del paciente para obtener la lista de pacientes del médico
    // Médico del paciente para buscar los pacientes que tengan los mismos médicos.
    // El id del paciente para identificar a esta conexión.
    welc.innerHTML += "Bienvenido/a " + pac.nombre + "!!!";
    //Empiezan a ejecutarse.
    adivinarMedico(pac.medico);
    mostrarMuestras(pac.id);
}




// Función de mostrar el nombre del médico
function adivinarMedico(idMedico) {
    var doctor = document.getElementById("pacsDoctor");
    doctor.innerHTML = "";
    var observaciones = document.getElementById("observations");
    observaciones.innerHTML = "";
    // Función 3 del servidor
    // Nos devuelve un objeto médico con el id indicado y el nombre.

    // Cuando llega aquí, se empieza a ejecutar mostrarMuestras, pero cómo mostrar muestras no utiliza ningún dato de médico o paciente no importaría.
    datosMedico(idMedico, function (medico) {
        if (medico != null) {
            med = medico
            // Pintamos los datos
            doctor.innerHTML += "Su médico es: " + med.nombre;
            observaciones.innerHTML += "OBSERVACIONES QUE SU MÉDICO LE HA ESCRITO: " + pac.observaciones;
        }
    });
}






// muestraDelPaciente es un array de los nombres de las muestras del paciente.
var muestrasDelPaciente = [];
// infoMuestras es un array de las muestras del paciente.
var infoMuestras = [];
// Función de mostrar las muestras del paciente
function mostrarMuestras(idPaciente) {
    // Hay que reiniciarlo dentro, sino van duplicando cada vez que entramos al sistema.
    muestrasDelPaciente = [];
    infoMuestras = [];
    // Obtenemos la referencia donde vamos a escribir las variables.
    var variablesPaciente = document.getElementById("variables");
    variablesPaciente.innerHTML = "";

    // Función 4 del servidor
    // Devuelve un array con todas las muestras del paciente.
    listadoMuestras(idPaciente, function (muestraPac) {
        if (muestraPac == null) {
            alert("Dicho paciente no tiene muestras asociadas")
        } else {
            // muestraPac es una lista de muestras del paciente.
            // Recorremos la lista de muestras del paciente y lo imprimos por pantalla todo el conjunto.
            for (var i = 0; i < muestraPac.length; i++) {
                variablesPaciente.innerHTML += "<section class='col-12'><dt>Variable: " + muestraPac[i].variable + "</dt><dd>Fecha: " + muestraPac[i].fecha + "</dd><dd>Valor: " + muestraPac[i].valor + "</dd><dd>Concepto:" + conceptoVariable(muestraPac[i].variable) + "</dd><dd><button class='btn btn-primary' onclick='eliminar(" + muestraPac[i].id + ")'>Eliminar</button><button class='btn btn-primary' onclick='compartir(" + muestraPac[i].id + ")'>Compartir muestra</button></dd></section>";
                muestrasDelPaciente.push(conceptoVariable(muestraPac[i].variable));
                // Guardamos los nombres de las variables de las muestras del paciente en orden.
                infoMuestras.push(muestraPac[i]);
                // Guardamos el conjunto de muestras del paciente
            }

        }
    })
}








// Función de eliminar las muestras incorrectas para el paciente.
function eliminar(id) {
    // Función 6 del servidor
    eliminarMuestra(id, function (booleano) {
        if (booleano == true) {
            // Si es correcto, solo tenemos que recargar la página de nuevo y ya estaría.
            refrescarPagina();
        }//No haría falta un control de flujo aquí, porque las muestras ya están comprobadas que existen.
    })
}




// Función para mostrar el nombre de la variable que se pasa por parámetro su id.
function conceptoVariable(idVariable) {
    for (var i = 0; i < nombreVariables.length; i++) {
        if (nombreVariables[i].id == idVariable) {
            return (nombreVariables[i].nombre);
        }
    }
}







// Función de agregar muestras con el id del paciente que hemos guardado anteriormente.
function agregarMuestraPaciente() {
    // Debemos pasarlos a número en vez de cadenas
    var variable = document.getElementById("variableNueva").value;
    variable = parseInt(variable)

    var valor = document.getElementById("valornuevo").value
    valor = parseInt(valor);

    // La fecha por defecto es ahora.
    var date = new Date();
    var fecha = date.toISOString().split("T")[0];

    // Función 5 del servidor
    agregarMuestra(idPac, variable, fecha, valor, function (valor) {
        if (valor == -1) {
            alert("Falta algún campo por rellenar o has introducido un número de variable no existente")
            document.getElementById("variableNueva").value = "";
            document.getElementById("variableNueva").focus();

        } else {
            document.getElementById("variableNueva").value = "";
            document.getElementById("valornuevo").value = "";
            // Actualizamos cada vez que agregamos una nueva muestra
            entrar();
        }
    })
}






// Función de filtrar las muestras.
// Obtenemos la referencia al select que deseamos filtrar.
var filtrado = document.getElementById("filtradoVariables");
// Le añadimos el addEventListener.
filtrado.addEventListener('change', function () {
    // Obtenemos la referencia de todas las variables en el index y lo vacíamos.
    var conjVariables = document.getElementById("variables");
    conjVariables.innerHTML = "";

    let valor = filtrado.value; //Dependiendo del valor del select

    switch (valor) {
        case "PESO (Kg)":
            mostrarFiltrado(1);
            break
        case "METROS ANDADOS":
            mostrarFiltrado(2);
            break
        case "METROS CORRIDOS":
            mostrarFiltrado(3);
            break
        case "MINUTOS DE GIMNASIA REALIZADOS":
            mostrarFiltrado(4);
            break
        case "TENSIÓN SANGUÍNEA MEDIA (MMGH)":
            mostrarFiltrado(5);
            break
        case "SATURACIÓN DE OXÍGENO MEDIA":
            mostrarFiltrado(6);
            break
        case "Mostrar todo": //Si selecciona esta opción, simplemente mostramos todas las muestras de este paciente, como ya lo hicimos anteriormente.
            mostrarMuestras(idPac);
            break
    }
})








// Creamos una función para mostrar solamente las muestras con la variable indicada:
function mostrarFiltrado(id) {
    // Obtenemos la referencia del html donde vamos a pintar las variables.
    var variablesfiltrado = document.getElementById("variables");
    variablesfiltrado.innerHTML = ""; //Lo vacíamos como siempre.

    //Recorremos las muestras de ese paciente.
    for (var i = 0; i < infoMuestras.length; i++) {
        // Si el id que se pasa por parámetro es el mismo que el que tiene el paciente. Pues se pinta.
        if (id == infoMuestras[i].variable) {
            variablesfiltrado.innerHTML += "<section class='col-12'><dt>Variable: " + infoMuestras[i].variable + "</dt><dd>Fecha: " + infoMuestras[i].fecha + "</dd><dd>Valor: " + infoMuestras[i].valor + "</dd><dd>Concepto: " + muestrasDelPaciente[i] + "</dd><dd><button class='btn btn-primary' onclick='eliminar(" + infoMuestras[i].id + ")'>Eliminar</button><button class='btn btn-primary' onclick='compartir(" + infoMuestras[i].id + ")'>Compartir muestra</button></dd></section>";
        }
    }
    if (variablesfiltrado.innerHTML == '') {
        alert("Todavía no tienes ninguna muestra de esta variable. Intente introducir alguna😊");
    }
}






// Función de salir de la interfaz del menú principal del paciente.
function salir() {
    cambiarSeccion("loginPac");
    var codigo = document.getElementById("accessCode");
    codigo.value = "";
    conexion.close();
}