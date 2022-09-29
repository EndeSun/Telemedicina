var conexion = '';
// Listen for messages
// Se lanza cuando un cliente manda un mensaje.


/////////////////////////////////////////////////////////////////////
// Esto son comentarios son importantes, nos dicen de cómo implementar los códigos

// rest.get(url, callback) --> Dos parámetros
// rest.post(url, body, callback) --> Tres parámetros (Creación) --> Necesitan 3 parámetros porque necesitan información para crear o modificar.
// rest.put(url, body, callback) --> (Modificación)
// rest.delete(url, callback)
// function callback(estado, respuesta) {...}

// Esto es la aplicación del cliente, la lógica del cliente

// Cómo se construye la petición

var idMedico = "";
var idPaciente = "";
var nombrePaciente = "";
var idVariable = "";
var nombreMedico = "";

// Aquí definimos la función de cambiar la sección en cada momento que se quiera.
//Definimos la función de cambiar secciones, el login es la sección actual (la primera interfaz que tenemos)
var seccionActual = "login";
function cambiarSeccion(seccion) {
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual = seccion;
}






// Guardamos las variables en un objeto global.
//Función asíncrona, se ejecuta paralelamente con los otros, no hay problemas de flujos.
// Al cargar la interfaz, ya obtenemos todas las variables de nuestra aplicación.
// Función 1 del servidor.
var miVar = [];
rest.get("/api/variable", (estado, respuesta) => {
    miVar = respuesta;
})










// Primera función que se utiliza en la aplicacíón.

function logear() {
    // Creo la variable del médico que se va a pasar por párametro en la función.
    // datosLogin es como médico
    var datosLogin = {
        login: document.getElementById('usuario').value,
        password: document.getElementById('password').value
    };

    // Función 2 del servidor
    rest.post('/api/medico/login', datosLogin, (estado, res) => {
        if (estado == 201) {
            //El método post nos devuelve el id del médico
            idMedico = res; //El id del médico es una variable global.
            var saludo = document.getElementById("saludo");
            //Siempre hay que vaciarlo, si no se va escribiéndose cada vez que invocamos esta función (entrar, salir).
            saludo.innerHTML = "";

            // No puedo sacarlo fuera porque se trata de una función asíncrona, 
            //Función 4 del servidor.
            rest.get("/api/medico/" + idMedico, (estado, res) => {
                //Nos devuelve un objeto médico con el id, nombre y login
                if (estado == 200) {
                    //Obtenemos el nombre del médico.
                    nombreMedico = res.nombre;
                    saludo.innerHTML += "Bienvenido/a " + nombreMedico//datosLogin.login;
                    // Actualizamos los datos definidos en la función de refrescar.

                    // Parte de websockets
                    conexion = new WebSocket('ws://localhost:4444', "pacientes");
                    // Este callback se lanza cuando el cliente se conecta.
                    conexion.addEventListener('open', function (event) {
                        // console.log("Cliente conectado!!!");
                        refrescarPagina();
                        // al conectarse el médico que le envie al servidor su id y quien es, para poder identificarlo.
                        conexion.send(JSON.stringify({ origen: "medico", idMedico: idMedico }));
                    });

                    // Aquí reciben todos los mensajes del servidor la parte de los médicos.
                    conexion.addEventListener('message', function (event) {
                        // console.log("Mensaje del servidor:", event.data);
                        // El médico solo recibe un tipo de mensaje que es el que el paciente le comparte.
                        var msg = JSON.parse(event.data);
                        if (msg.contenido == "mensaje") {
                            alert(msg.mensaje);
                        }
                    });

                }
                //No nos va a saltar alerta de que no existe un médico con el id, porque ya se ha comprobado en el login.
            })
        } else {
            alert(res) //res es la respuesta en formato json que nos devuelve el servidor --> La autentificación no es correcta.
        }
    })
}










// objeto con todos los pacientes del medico
var pacientesDelMedico = [];
// Función para refrescar la página una vez el médico actualice los datos del paciente.
function refrescarPagina() {
    // Se cambia al menu-principal del médico --> La interfaz principal.
    cambiarSeccion("menu-principal");

    // Obtenemos la referencia del html donde vamos a pintar la lista de pacientes.
    var parrafoListaPaciente = document.getElementById("listadoPaciente");
    parrafoListaPaciente.innerHTML = ""; // Se pone vacío primero para cada vez que entre no vaya sumando

    // Función 5 del servidor.
    rest.get('/api/medico/' + idMedico + '/pacientes', (estado, res) => {
        if (estado == 200) {
            // En este caso, la respuesta es una lista de pacientes del médico con ese id .
            // Lo guardamos en una variable externa.
            pacientesDelMedico = res;

            for (i in pacientesDelMedico) { //O también for(var i = 0; i< pacientesDelMedico.length; i++{})
                parrafoListaPaciente.innerHTML += "<dt>ID: " + pacientesDelMedico[i].id + "</dt><dd>NOMBRE: " + pacientesDelMedico[i].nombre + "</dd><dd>GÉNERO: " + pacientesDelMedico[i].genero + "</dd><dd>FECHA DE NACIMIENTO: " + pacientesDelMedico[i].fecha_nacimiento + "</dd><dd><button onclick='consultarExpediente(" + pacientesDelMedico[i].id + ")'>Consultar Expediente</button></dd>" + "<br/><br/>"
            }
        } else {

            alert(res); //Si se borran todos los pacientes, salta la alerta que este médico no tiene asignado ningún paciente o si el médico no tiene pacientes como en este caso, Paula, que salga la alerta.
        }
    })
}









// Función para consultar los datos de cada paciente
function consultarExpediente(indice) {
    idPaciente = indice

    // Cambiamos a la interfaz del paciente seleccionado.
    cambiarSeccion("datos-paciente");

    // Obtenemos la referencia donde vamos a pintar la información del paciente.
    var parrafoDatosPaciente = document.getElementById('infoPaciente');
    parrafoDatosPaciente.innerHTML = "";

    // Función 3 del servidor.
    rest.get('/api/paciente/' + idPaciente, (estado, res) => {
        if (estado == 200) {
            // En este caso, la respuesta es un objeto paciente con su id, nombre, medico y observaciones.
            parrafoDatosPaciente.innerHTML += "<dt>ID: " + res.id + "</dt><dd>NOMBRE: " + res.nombre + "</dd><dd>OBSERVACIONES: " + res.observaciones + "</dd><dd><button onclick='cambiarDatos(" + res.id + ")'>Modificar datos del paciente</button></dd>" + "<br/><br/>"
            // Mostramos las muestras que tiene este paciente.
            mostrarMuestras();
        }
        // En este caso, no nos va a saltar ninguna alerta, porque se crea el botón de consularExpediente de un paciente que existe.
    })
}









var informacionMuestras = ""
// Para mostrar las muestras que tiene asociado el paciente.
function mostrarMuestras() {

    var parrafoDatosMuestras = document.getElementById('infoMuestras');
    parrafoDatosMuestras.innerHTML = "";

    // Creamos una variable global para guardar la infomación de las muestras para el filtrado de los valores
    informacionMuestras = "";
    // Función 8 del servidor.
    rest.get("/api/paciente/" + idPaciente + "/muestras", (estado, res) => {
        if (estado == 200) {
            // En este caso nos devuelve una lista de muestras ordenados según su id y fech del paciente
            for (var i = 0; i < res.length; i++) {
                // Recorremos la lista de muestras
                var idVar = res[i].variable;
                // Guardamos el id de la muestra en una variable para buscarlo en las variables de mi aplicación.
                for (var j = 0; j < miVar.length; j++) {
                    // Buscamos el id en las variables para obtener el nombre de la variable.
                    if (miVar[j].id == idVar) {
                        var nombreVariable = miVar[j].nombre;
                    }
                }
                informacionMuestras = res;
                parrafoDatosMuestras.innerHTML += "<dt>Variable: " + idVar + "</dt><dd>Concepto de la variable: " + nombreVariable + "</dd><dd>Valor: " + res[i].valor + "</dd><dd>Fecha: " + res[i].fecha + "</dd></br>";
            }
        } else {
            alert(res); //En este caso, el paciente puede no tener muestras asociadas o que puede haberlas borrado.
        }
    })
}












// Añadimos esta parte para filtrar las muestras por las variables.
var filtMuestra = document.getElementById("filtroVar");
filtMuestra.addEventListener('change', () => {
    var conjVariables = document.getElementById("infoMuestras");
    conjVariables.innerHTML = '';
    var filtValor = filtMuestra.value;
    switch (filtValor) {

        case "PESO (Kg)":
            mostrarFiltrado(1)
            break
        case "METROS ANDADOS":
            mostrarFiltrado(2)
            break
        case "METROS CORRIDOS":
            mostrarFiltrado(3)
            break
        case "MINUTOS DE GIMNASIA REALIZADOS":
            mostrarFiltrado(4)
            break
        case "TENSIÓN SANGUÍNEA MEDIA (MMGH)":
            mostrarFiltrado(5)
            break
        case "SATURACIÓN DE OXÍGENO MEDIA":
            mostrarFiltrado(6)
            break
        case "Mostrar todas las muestras":
            mostrarMuestras();
            break
    }
})

function mostrarFiltrado(id) {
    var varFiltrado = document.getElementById("infoMuestras");
    varFiltrado.innerHTML = "";
    for (var i in informacionMuestras) {
        if (informacionMuestras[i].variable == id) {
            varFiltrado.innerHTML += "<dt>Variable: " + informacionMuestras[i].variable + "</dt><dd>Concepto de la variable: " + mostrarConcepto(informacionMuestras[i].variable) + "</dd><dd>Valor: " + informacionMuestras[i].valor + "</dd><dd>Fecha: " + informacionMuestras[i].fecha + "</dd></br>"
            // console.log(informacionMuestras[i]);
        }
    }
    if(varFiltrado.innerHTML == ''){
        alert("Este paciente no tiene ninguna muestra asociada con esta variable");
    }
}

function mostrarConcepto(id){
    for(var i in miVar){
        if(miVar[i].id == id){
            return(miVar[i].nombre)
        }
    }
}

function volverDeDatosPaciente(){
    cambiarSeccion("menu-principal");
    varFiltrado = document.getElementById("filtroVar");
    varFiltrado.value = varFiltrado[0].value;
}

// Cuando salimos de la página de datos del paciente, vamos a restablecer los valores predeterminados del select que hemos realizado
function salirDeDatosPaciente(){
    cambiarSeccion("login");
    varFiltrado = document.getElementById("filtroVar");
    varFiltrado.value = varFiltrado[0].value;
    var userName = document.getElementById("usuario");
    var userPassword = document.getElementById("password");
    conexion.close();
    userName.value = "";
    userPassword.value = "";
}










// Esta función trata de abrir una nueva página html para que el usuario pueda introducir los datos a cambiar del paciente
function cambiarDatos(indice) {
    // El id es del paciente.
    idPaciente = indice;
    // Cambiamos a la interfaz de modificar los datos del paciente.
    cambiarSeccion("modificar-paciente");

    // Obtenemos la referencia de los inputs, para rellenarlos ahora para facilitar la modificación de los datos al médico
    var nombrePaciente = document.getElementById("nombrePacienteCambio");
    var fechaPaciente = document.getElementById("bornDateCambio");
    var generoPaciente = document.getElementById("genderCambio");
    generoPaciente.innerHTML = "";
    var medicoDelPaciente = document.getElementById("medicoCambio");
    var codigoPaciente = document.getElementById("accesCodeCambio");
    var observacionesPaciente = document.getElementById("observationsCambio");

    // Función 5 del servidor
    rest.get("/api/medico/" + idMedico + "/pacientes", (estado, respuesta) => {
        if (estado == 200) {
            // La respuesta es una lista de pacientes del médico.
            for (var i = 0; i < respuesta.length; i++) {
                // Comprobamos que sea el mismo paciente, para pintar los datos del paciente en el input
                if (idPaciente == respuesta[i].id) {
                    nombrePaciente.value = respuesta[i].nombre;
                    fechaPaciente.value = respuesta[i].fecha_nacimiento;
                    // El género es diferentes, porque tiene dos opciones, entonces, depende de lo que tenga escrito el médico, que me cree uno u otro. (para facilitar el uso al médico)
                    if (respuesta[i].genero == "Masculino") {
                        generoPaciente.innerHTML += "<option selected>Masculino</option><option>Femenino</option>";
                    } else {
                        generoPaciente.innerHTML += "<option>Masculino</option><option selected>Femenino</option>";
                    }
                    medicoDelPaciente.value = respuesta[i].medico;
                    codigoPaciente.value = respuesta[i].codigo_acceso;
                    observacionesPaciente.value = respuesta[i].observaciones;
                }
                // No hace falta capturar el error, porque el médico seguro tiene este paciente.
            }
        }
    })
    //Voy a rellenar los campos de inputs con los valores que tiene para tener mayor facilidad de modificación.
}








// Función verdadera de modificar los datos del paciente.
function actualizarDatosPaciente() {
    var cambioPaciente = {
        id: idPaciente,
        nombre: document.getElementById("nombrePacienteCambio").value,
        fecha_nacimiento: document.getElementById("bornDateCambio").value,
        genero: document.getElementById("genderCambio").value,
        medico: document.getElementById("medicoCambio").value, //Si no hace falta, borrar de aquí y ya 
        codigo_acceso: document.getElementById("accesCodeCambio").value,
        observaciones: document.getElementById("observationsCambio").value,
    }

    // Comprobamos si el id del médico que introduce existe o no
    rest.get("/api/medico/" + cambioPaciente.medico, (estado, respuesta) => {
        if (estado == 200) {

            // Función 7 del servidor.
            rest.put("/api/paciente/" + idPaciente, cambioPaciente, (estado, respuesta) => {
                if (estado == 200) {
                    // Actualizamos los datos del paciente
                    refrescarPagina();
                } else {
                    alert(respuesta);
                }
            })
        } else {
            alert(respuesta); //Si no existe el médico nos salta la alerta.
        }
    })
}







var contadorIdPaciente = 8;
// Esta es la función de añadir pacientes, la que recoje los valores que introduce el médico por tecla
function addPacienteDentro() {
    // Obtenemos la referencia a los distintos campos que ha introducido el médico, sobre todo para luego vaciarlos cada vez que se añade el paciente y no se quede con los datos del paciente anterior.
    var name = document.getElementById("nombrePaciente");
    var bornDateNew = document.getElementById("bornDate");
    var genderNew = document.getElementById("gender");
    var accesCodeNew = document.getElementById("accesCode");
    var observationsNew = document.getElementById("observations");
    // Creamos un objeto paciente nuevo para pasar por parámetro al método post.
    var nuevoPaciente = {
        id: contadorIdPaciente,
        nombre: name.value,
        fecha_nacimiento: bornDateNew.value,
        genero: genderNew.value,
        medico: idMedico,
        codigo_acceso: accesCodeNew.value,
        observaciones: observationsNew.value
    }
    // Acordemos que el id es del médico y no del paciente.
    // Función 6 del servidor.
    rest.post("/api/medico/" + idMedico + "/pacientes", nuevoPaciente, (estado, respuesta) => {
        if (estado == 201) {
            // La respuesta es que nos devuelve el paciente nuevo.
            // Al añadir cambiamos al menú principal del médico y mostramos de nuevo los pacientes que tiene ese médico.
            refrescarPagina();
            contadorIdPaciente++;
            name.value = "";
            bornDateNew.value = "";
            genderNew.value = 'Seleccione';
            accesCodeNew.value = "";
            observationsNew.value = "";
        } else {
            //No hace falta comprobar el médico, pero deberíamos comprobar si los campos están vacíos o no.
            alert(respuesta);
        }
    })
}








// Función de mostrar los datos de usuario del médico
function datosUsuario() {
    // Cambiamos a la interfaz donde nos saltará una breve información del usuario médico
    cambiarSeccion("datos-usuarios");
    var parrafoInfoMedico = document.getElementById("infoMedico");
    parrafoInfoMedico.innerHTML = "";
    // Función 4 del servidor.
    rest.get("/api/medico/" + idMedico, (estado, respuesta) => {
        if (estado == 200) {
            // Nos devuelve un objeto médico con el id, nombre y login.
            parrafoInfoMedico.innerHTML += "ID USUARIO: " + respuesta.id + "<br/>NOMBRE: " + respuesta.nombre + "<br/>LOGIN: " + respuesta.login + "<br/><br/>";
        }
        // No nos saltará el error, igual caso que cuando tenemos que mostrar el mensaje de bienvenida.
        // Ya se ha comprobado en el login si dicho médico existe o no.
    })
}








// Cambiamos a la interfaz de login del médico --> 
function salir() {
    cambiarSeccion("login");
    var userName = document.getElementById("usuario");
    var userPassword = document.getElementById("password");
    conexion.close();
    userName.value = "";
    userPassword.value = "";
}