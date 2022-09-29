var rpc = require("./rpc.js");
rpc.debug = true;

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
var conexion = mysql.createConnection(basedatos);

// Conectamos la conexion
conexion.connect(function (err) {
    // Si hay algún error
    if (err) {
        // console.error("Error en la conexión de base de datos", err);
        process.exit();
    }
})



// De alguna manera tengo que conectar el servidor que contiene la base de datos del médico con 
// el del paciente, para poder tener las mismas variables y trabajar con ellas.
// De esta manera obtenemos todos los datos necesarios. En datos, estas variables se exportan con module.exports.NombreVariableQueAsigno = NombreVariableQueQuieroExportar 
// function login(codigoAcceso) {
//     for (var i = 0; i < pacientes.length; i++) {
//         // Por si acaso, que no entre con contraseña vacía.
//         if (pacientes[i].codigo_acceso == codigoAcceso && codigoAcceso != '') {
//             return (pacientes[i])
//         }
//     }
//     return (null);
// }
// Descripción: Realiza un login para paciente.

// Función 1
// Devuelve un objeto con todos los datos del paciente o NULL si el código no es correcto
function login(codigoAcceso, callback) {
    conexion.query("SELECT * from pacientes WHERE codigo_acceso = '" + codigoAcceso + "'", function (error, paciente) {
        if (error) {
            // Error en la consulta
            callback(null);
        } else {
            if (paciente == "") {
                callback(null);
            }
            else {
                callback(JSON.parse(JSON.stringify(paciente[0])));
            }
        }
    })
}


// Descripción: Obtiene un listado de las variables

// Función 2
// Devuelve un array con todas las variables
// function listadoVariables() {
//     return (variables);
// }

function listadoVariables(callback) {
    conexion.query("select * from variables", function (error, variables) {
        if (error) {
            callback(null);
        } else {
            callback(variables);
        }
    })
}


// Descripción: Obtiene los datos del médico indicado

// Función 3
// Devuelve un objeto con los datos del médico (excepto login y password). Si no existe devuelve NULL.
// function datosMedico(idMedico) {
//     var medico = {};
//     for (var i = 0; i < ListaMedico.length; i++) {
//         if (ListaMedico[i].id == idMedico) {
//             medico["id"] = ListaMedico[i].id;
//             medico["nombre"] = ListaMedico[i].nombre;
//             return (medico);
//         }
//     }
//     return (null);
// }

function datosMedico(idMedico, callback) {
    conexion.query("select id,nombre from listamedico where id='" + idMedico + "'", function (error, medico) {
        if (error) {
            callback(null);
        } else {
            if (medico == "") {
                callback(null);
            } else {
                callback(JSON.parse(JSON.stringify(medico[0])));
            }
        }
    })
}


// Descripción: Obtiene un listado de los valores de variables del paciente

// Función 4
// Devuelve un array con todos las muestras introducidos por ese paciente.
// function listadoMuestras(idPaciente) {

//     var muestraPac = [];

//     for (var i = 0; i < muestras.length; i++) {
//         if (muestras[i].paciente == idPaciente) {
//             muestraPac.push(muestras[i]);
//         }
//     }

//     if (muestraPac.length != 0) {
//         return (muestraPac);
//     } else {
//         return (null)
//     }
// }

function listadoMuestras(idPaciente, callback) {
    conexion.query("select * from muestras where paciente='" + idPaciente + "'", function (error, muestras) {
        if (error) {
            callback(null);
        } else {
            if (muestras == "") {
                callback(null);
            } else {
                callback(muestras);
            }
        }
    })
}

// Descripción: añade una nueva muestra

// Función 5
// Devuelve el Id de la nueva muestra
// function agregarMuestra(idPaciente, idVariable, fecha, valor) {
//     // console.log("Nueva muestra", idPaciente, idVariable, fecha, valor);
//     if (!idPaciente || !idVariable || !fecha || !valor || idVariable > variables.length) {
//         return -1;
//     } else {
//         var nuevaMuestra = {
//             id: contadorMuestras,
//             paciente: idPaciente,
//             variable: idVariable,
//             fecha: fecha,
//             valor: valor
//         }
//         retorno = contadorMuestras;
//         muestras.push(nuevaMuestra);
//         contadorMuestras++;
//         return (retorno);
//     }
// }

function agregarMuestra(idPaciente, idVariable, fecha, valor, callback) {
    // Aquí obtengo todos los valores de las variables
    // console.log("Longitud de las variables",variables.length)
    conexion.query("select * from variables", function (error, variables) {
        if (error) {
            callback(null);
        } else {
            if (!idPaciente || !idVariable || !fecha || !valor || idVariable > variables.length) {
                callback(-1);
            } else {
                // En caso de que todo es correcto:
                conexion.query("insert into muestras (paciente,variable,fecha,valor) values ('" + idPaciente + "','" + idVariable + "','" + fecha + "','" + valor + "')", function (errorMuestra, muestra) {
                    if (errorMuestra) {
                        // Error en la inserción de los datos
                        callback(null)
                    } else {
                        callback(muestra.insertId)
                        // callback(idMuestra)
                    }
                })
            }
        }
    })
}


// Descripción: Elimina una muestra

// Función 6
// Devuelve un booleano indicando si ha ido bien
// function eliminarMuestra(idValor) {
//     for (var i = 0; muestras.length; i++) {
//         if (muestras[i].id == idValor) {
//             muestras.splice(i, 1); //Borra en la posición encontrada, 1 objeto.
//             // console.log("Muestra borrada con identificador", idValor);
//             return true;
//         }
//     }
//     return false;
// }

function eliminarMuestra(idValor, callback) {
    conexion.query("delete from muestras where id='" + idValor + "'", function (error, muestra) {
        if (error) {
            callback(false);
        } else {
            // console.log("muestra Eliminada",idValor)
            callback(true)
        }
    })
}

// // Función implementada en el examen --> aumentar los valores de todas las muestras en 1.
// function incrementar(idPaciente) {
//     for (var i = 0; i < muestras.length; i++) {
//         if (muestras[i].paciente == idPaciente) {
//             muestras[i].valor += 1;
//         }
//     }
//     return muestras;
// }

function incrementar(idPaciente, callback) {
    conexion.query("select * from muestras where paciente='" + idPaciente + "'", function (error, muestrasPac) {
        if (error) {
            callback(null);
        } else {
            for (let i = 0; i < muestrasPac.length; i++) {
                conexion.query("UPDATE muestras SET valor='" + (muestrasPac[i].valor + 1) + "' WHERE id='" + muestrasPac[i].id + "'", function (errorActualizar, muestraActualizado) {
                    if (errorActualizar) {
                        callback(null);
                    }
                })
            }
            // El callback siempre se ejecuta una vez, es como un break, entonces si lo metemos dentro solo se actualizaría a un valor solo.
            callback(muestrasPac);
        }
    })
}
// Se crea un servidor
var servidor = rpc.server();

// Se crea una aplicación RPC en el servidor con un identificador determinado
var app = servidor.createApp("MiGestionPacientes");

// Se registran los procedimientos asociados a la aplicación
app.registerAsync(login);
app.registerAsync(listadoVariables);
app.registerAsync(datosMedico);
app.registerAsync(listadoMuestras);
app.registerAsync(agregarMuestra);
app.registerAsync(eliminarMuestra);
app.registerAsync(incrementar);
// Preparando para el examen
// app.register();
// app.register();
// app.register();

