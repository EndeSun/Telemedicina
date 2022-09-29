// Conexión a MySQL
const mysql = require("mysql");

// La base de datos, en formato de json
const basedatos = {
	// Los datos son los que has creado antes en la base de datos
	host: "localhost",
	user: "ende",
	password: "123",
	database: "practica_telemedicina"
};

// Creamos la variable de conexión a la base de datos
var conexionSql = mysql.createConnection(basedatos);

// Conectamos la conexion
conexionSql.connect(function (err) {
	// Si hay algún error
	if (err) {
		// console.error("Error en la conexión de base de datos", err);
		process.exit();
	}
})
// Crear un servidor web HTTP
var http = require("http"); //Este viene con node, ya está instalado
var httpServer = http.createServer();
// Crear servidor WS
var WebSocketServer = require("websocket").server; // instalar previamente: npm install websocket
var wsServer = new WebSocketServer({
	httpServer: httpServer
});

// Iniciar el servidor HTTP en un puerto
var puerto = 4444;

// Lo ponemos es un puerto y lo iniciamos
httpServer.listen(puerto, function () {
	// console.log("Servidor de WebSocket iniciado en el puerto:", puerto);
});

// Array de las conexiones
var clientes = []; // Todas las conexiones (clientes) de mi servidor tanto médico como paciente

// El servidor está esperando una petición de conexión. 
wsServer.on("request", function (request) { // este callback se ejecuta cuando llega una nueva conexión de un cliente
	// En este caso, siempre se acepta, Se puede poner condiciones.
	// Pacientes es un nombre de protocolo.
	var connection = request.accept("pacientes", request.origin); // aceptar conexión
	// Cliente en singular es solo ese cliente, solo un paciente o solo ese médico que ha realizado la conexión.
	var cliente = { connection: connection };
	// Clientes en plural es la lista total. Cuando quiero mandar mensajes, lo busco en clientes.
	clientes.push(cliente); // guardar la conexión

	console.log("Cliente conectado. Ahora hay", clientes.length);
	// Clientes tiene la estructura de --> clientes.connection, clientes.id y clientes.origen

	// Cada vez que el cliente me manda un mensaje. 
	// En esta parte se reciben TOOOOOODOOOOOOOOS LOS MENSAJES.
	connection.on("message", function (message) { // mensaje recibido del cliente
		if (message.type === "utf8") { //Mensaje textuales porque tiene utf8.

			// Se reciben los mensajes de los clientes (médico o paciente).
			console.log("Mensaje del cliente: " + message.utf8Data);

			// JSON.parse es para convertir de texto a objeto --> Lo contrario de stringify (que transforma a texto plano).
			var msg = JSON.parse(message.utf8Data);

			// Procesa los datos para obtener todos los pacientes del médico del paciente que ha mandado el mensaje.

			// Este es el primer mensaje que le manda el paciente al servidor. (Para obtener la lista de pacientes que tiene su médico y poder compartirlo con ellas)
			// En el cliente no podemos saber qué pacientes tiene el médico.
			if (msg.origen == "paciente1") {

				// Para identificar luego las conexiones
				cliente.id = msg.idPac; //Tenemos  las conexiones y el id del paciente
				cliente.origen = "paciente";


				// Todos los pacientes de ese médico
				conexionSql.query("select * from pacientes where medico='" + msg.medicoPacienteConectado + "'", function (errorPacientesDelMedico, pacientesDelMedico) {
					if (errorPacientesDelMedico) {
						connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "Error en la obtención de datos de los pacientes de su médico" }));
					} else {
						// Enviando solo el mensaje a la conexión actual, es decir al paciente. listaP : lista de pacientes del médico del paciente que ha enviado el mensaje
						connection.sendUTF(JSON.stringify({ contenido: "listaPaciente", listaP: pacientesDelMedico }));
					}
				})
			}

			if (msg.origen == "medico") {
				// Para identificar la conexión que se hace desde el médico
				cliente.id = msg.idMedico;
				cliente.origen = "medico";
				// Solo me muestra ese cliente.
				// console.log(cliente);
			}

			// Cuando el paciente envía datos para compartir la muestra.
			if (msg.origen == "paciente2") {
				// Construimos el mensaje que se desea compartir.
				var fechaMuestra = "";
				var valorMuestra = "";
				var variableMuestra = "";
				var nombreVariableMuestra = "";
				// El mensaje que se quiere compartir
				var mensajeCompartir = "";

				// Para obtener los datos de la muestra
				conexionSql.query("select * from muestras where id='" + msg.idMuestraCompartir + "'", function (errorMuestraCompartir, muestraCompartir) {
					if (errorMuestraCompartir) {
						connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "Error en la obtención de datos de la muestra a compartir del paciente" }));
					} else {
						console.log("Datos obtenidos: ",muestraCompartir[0].fecha)
						fechaMuestra = muestraCompartir[0].fecha;
						valorMuestra = muestraCompartir[0].valor;
						variableMuestra = muestraCompartir[0].variable;
						// Nos falta el nombre de la variable de la muestra a compartir
						conexionSql.query("select * from variables where id='" + variableMuestra + "'", function (errorVariableMuestra, variableMuestra) {
							if (errorVariableMuestra) {
								connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "Error en la obtención del nombre de la variable de la muestra a compartir del paciente" }));
							} else {
								// Ya tenemos todas la información para construir el mensaje
								// console.log("Nombre obtenido: ",valorMuestra.nombre)
								nombreVariableMuestra = variableMuestra[0].nombre;
								// Construimos el mensaje
								mensajeCompartir = msg.nombrePaciente + " ha compartido contigo que el día " + fechaMuestra + " realizó la actividad de " + nombreVariableMuestra + " y obtuvo un valor de " + valorMuestra;
								// Le pueden llegar medico, all o el id del paciente que quiere enviar el mensaje.

								// Para el caso de que el paciente quiere compartir al médico
								if (msg.idPersonaCompartir == "medico") {
									// Creo un Variable para ver si está conectado el médico o no.
									var check = false;
									// Recorremos la lista de las conexiones
									for (var m = 0; m < clientes.length; m++) {
										// Tiene que cumplir tanto la condición de que sea el mismo id del médico que el paciente ha copartido el mensaje y que la conexión sea médico y no el paciente.
										// msg.medico es el medico del paciente.
										if (msg.medico == clientes[m].id && clientes[m].origen == "medico") {
											check = true
											// Se le envia al médico
											clientes[m].connection.sendUTF(JSON.stringify({ contenido: "mensaje", mensaje: mensajeCompartir }));
											// Se le envia al cliente
											connection.sendUTF(JSON.stringify({ contenido: "mensajeCorrecto", mensaje: "Mensaje enviado correctamente" }));
										}
									}
									if (check == false) {
										// console.log("Su médico no está conectado");
										// Un mensaje de error cuando el medico ese no está conectado.
										// Si no está conectado se le envia el mensaje de error al paciente que desea compartir el mensaje
										connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "Su médico no está conectado" }));
									}
								}

								// Cunado el paciente quiere compartir con todos.
								if (msg.idPersonaCompartir == "all") {
									// El check es para comprobar la conexión
									var check = false;
									for (var n = 0; n < clientes.length; n++) {
										// Que no se envie al paciente que ha dado a compartir el mensaje.
										if (clientes[n].origen == "paciente" && clientes[n].id != msg.idPaciente) {
											check = true;
											// Para compartir a todos
											clientes[n].connection.sendUTF(JSON.stringify({ contenido: "mensaje", mensaje: mensajeCompartir }));
											// Devolver la respuesta al paciente que ha compartido la muestra.
											connection.sendUTF(JSON.stringify({ contenido: "mensajeCorrecto", mensaje: "Mensaje enviado correctamente" }));
										}
									}
									if (check == false) {
										// Un mensaje de error cuando el paciente ese no está conectado.
										connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "No hay ningún paciente conectado" }));
									}
								}

								// Cuando el paciente quiere compartir a un paciente de su médico en concreto
								if (msg.idPersonaCompartir != "all" && msg.idPersonaCompartir != "medico") {
									var check = false;
									for (var o = 0; o < clientes.length; o++) {
										// mag.idPersonaCompartir es el id del paciente que quiere compartir.

										if (clientes[o].origen == "paciente" && clientes[o].id == msg.idPersonaCompartir) {
											// Un check de que el mensaje se ha enviado correctamente al usuario destinado.
											check = true;
											clientes[o].connection.sendUTF(JSON.stringify({ contenido: "mensaje", mensaje: mensajeCompartir }));
											connection.sendUTF(JSON.stringify({ contenido: "mensajeCorrecto", mensaje: "Mensaje enviado correctamente" }));
										}
									}
									if (check == false) {
										// console.log("Este paciente no está conectado");
										// Un mensaje de error cuando el paciente ese no está conectado.
										connection.sendUTF(JSON.stringify({ contenido: "mensajeError", mensaje: "Este paciente no está conectado" }));
									}
								}
							}
						})
					}
				})
			}
		}
	});

	// Cada vez que un cliente se desconecta. Se mantiene igual
	connection.on("close", function (reasonCode, description) { // conexión cerrada
		// Recorremos todas las conexiones
		for (var l = 0; l < clientes.length; l++) {
			// cliente es la conexión actual, si es igual a la lista de conexión,
			if (clientes[l] == cliente) {
				// Cortamos esa conexión de la lista de conexiones.
				clientes.splice(l, 1);
			}
		}
		console.log("Cliente desconectado. Ahora hay", clientes.length);
	});
});