// Repositorio de github https://github.com/EndeSun/Telemedicina.git
const { query } = require("express");
var express = require("express");
var app = express();

// Los parámetros de conexión
// El que tiene todas los protocolos de comunicación de Mysql para que el servidor lo entienda
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
        console.error("Error en la conexión de base de datos", err);
        process.exit();
    }
})

app.set('json spaces', 1);

// Creo una carpeta que se llama cliente, y con el express static tiene que ser el nombre de la carpeta, y este método busca el index.html dentro de la carpeta y lo redirije
app.use("/medico", express.static("../Medico"));
app.use("/paciente", express.static("../Paciente"));

// Configuraciones, para que el servidor entienda el formato json.
// Los uses son como imports
app.use(express.json()); // en el req.body tengamos el body JSON

// • 200: Si todo ha ido bien
// • 201: Si un servicio POST ha creado correctamente un registro
// • 404: Si se solicita un elemento que no existe (p.e. GET /api/medico/7, y no 
// existe un médico con código 7)
// • 403: Si la autenticación (login) no es correcta


// Utilizado para mostrar el concepto de las variables
// URL 1, 
app.get("/api/variable", (req, res) => {
    // Una sentencia de mysql

    var sqlVar = "select * from variables";
    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlVar, function (err, data) {
        if (err) {
            console.error("Error en la recuperación de datos", err);
            return;
        }
        // console.log("Datos obtenidos", data);
        res.status(200).json(data);
    });
})

// Realiza un login para el médico, en body se indican las credenciales. Por ejemplo: {"login": "xxx", "password": "secreto"}, si va bien se obtiene el id del médico

// Utilizado para realizar el login del médico --> Check
// URL 2,
app.post("/api/medico/login", function (req, res) {

    // Al ser un método post, se define un objeto, cuando el main tiene que pasar por parámetro tiene que tener la misma forma.
    var medico = { //Usamos un objeto cuando hay más de un campo
        login: req.body.login, // Req.body es la variable que le pasamos a postman
        password: req.body.password //Req.body es la variable que se la va a pasar por parámetro en el main.
    };


    var sqlListaMedico = "select * from listamedico";

    conexion.query(sqlListaMedico, function (err, ListaMedico) {
        if (err) {
            console.error("Error en la recuperación de datos", err);
            return;
        }
        // console.log("Datos obtenidos", ListaMedico);
        //Recorremos la lista de los médicos
        for (var i = 0; i < ListaMedico.length; i++) {
            //Si el login está y la contraseña tambiéne está entra en la condición.
            console.log(ListaMedico[i].login)
            if (medico.login == ListaMedico[i].login && medico.password == ListaMedico[i].password) {
                return res.status(201).json(ListaMedico[i].id);
            }
        }

        return res.status(403).json("La autenticación (login) no es correcta");
    });


});

// /api/paciente/:id get -->Obtiene los datos del paciente indicado (no devolver código de acceso)
// URL 3,

// Utilizado un get dentro de un get

app.get("/api/paciente/:id", (req, res) => {

    var id = req.params.id; //Req.params obtiene referencia a la url que en el main lo introduciremos que paciente queremos.
    // Se crea otra variable para no eliminarlo en la lista original de pacientes-

    // Variable de paciente
    var sqlPac = "select id,nombre,medico,observaciones from pacientes where id='" + id + "'";
    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlPac, function (err, paciente) {
        if (err) {
            console.error("Error en la recuperación de datos", err);
            return;
        }
        else if (paciente.length == 0) {
            return res.status(404).json("No se ha encontrado un paciente con dicho id");
        }
        else {
            // console.log("Paciente:",JSON.parse(JSON.stringify(paciente[0])));
            return res.status(200).json(JSON.parse(JSON.stringify(paciente[0])));
        }
    });
})

// Utilizado para obtener los datos del médico --> Check //Tiene la misma forma que el get del paciente anterior.
// URL 4, 
app.get("/api/medico/:id", (req, res) => {

    var id = req.params.id;
    // var medicosc ='{"id": '+ medico[id].id +  '" nombre:" '+ medico[id].nombre + '"login:" ' + medico[id].login + "}" ;

    //Creamos otra variable para no eliminarlo en la lista original

    // Variable listaMedico
    var sqlListaMedico = "select id,nombre,login from listamedico where id='" + id + "'";

    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlListaMedico, function (err, medico) {
        if (err) {
            console.error("Error en la recuperación de datos", err);
            return;
        }
        else if (medico.length == 0) {
            return res.status(404).json("No se ha encontrado un médico con dicho id");
        }
        else {
            // Conversión de los datos crudos a un objeto individual.
            // console.log(medico)
            // console.log(JSON.stringify(medico))
            // console.log(JSON.parse(JSON.stringify(medico)))
            // console.log(JSON.stringify(medico[0]))
            return res.status(200).json(JSON.parse(JSON.stringify(medico[0])));
        }
    });
});

// Utilizados para obtener todos los pacientes de un médico y mostrarlo en el index.html --> Check
// URL 5, /api/medico/:id/pacientes --> Método get, obtiene un array con los datos de sus pacientes.
app.get("/api/medico/:id/pacientes", (req, res) => {

    // Aquí necesitamos un check porque el bucle puede encontrar más de un paciente por médico: Un médico puede tener más de un paciente
    // var check = false;

    var id = req.params.id; //Este id es el del médico
    // console.log(pacientes.length);

    var sqlPac = "select * from pacientes where medico='" + id + "'";
    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlPac, function (err, paciente) {
        if (err) {
            return res.status(500).json("Error en la recuperación de datos");
        }

        if (paciente.length != 0) {
            return res.status(200).json(JSON.parse(JSON.stringify(paciente)))
        } else {
            return res.status(404).json("Este médico no tiene asignado ningún pacientes");
        }
    });
})


// Utilizado para crear un nuevo paciente --> Check
// URL 6, /api/medico/:id/pacientes --> Método post, crea un nuevo paciente
app.post("/api/medico/:id/pacientes", (req, res) => {

    //Id del medico, creamos un paciente de este médico.
    var id = req.params.id;
    // Recorremos la lista de Médico para ver si existe este médico con este id.
    var sqlPac = "select * from pacientes";
    var sqlListaMedico = "select * from listamedico WHERE id = '" + id + "'"

    conexion.query(sqlListaMedico, function (errMed, ListaMedico) {
        if (errMed) {
            // console.error("Error al obtener los datos del médico");
            return res.status(404).json("Error al obtener los datos del médico");
        } else if (ListaMedico.length == 0) {
            // console.log("ListaMedico:",ListaMedico);
            return res.status(404).json("No existe un médico con dicho id")
        }

        // Para obtener los datos del paciente
        conexion.query(sqlPac, function (errPac, pacientes) {
            if (errPac) {
                return res.status(404).json("Error en la recuperación de datos del paciente");;
            }
            // console.log("pacientes",pacientes);

            // Si existe el médico creamos un objeto paciente con las siguientes características
            var paciente = {
                // Si existe creamos un paciente
                nombre: req.body.nombre,
                fecha_nacimiento: req.body.fecha_nacimiento,
                genero: req.body.genero,
                medico: id, //Donde el medico es el id del médico que hemos obtenido la referencia arriba.
                codigo_acceso: req.body.codigo_acceso,
                observaciones: req.body.observaciones
            }

            // Para comprobar si el código de acceso se repite o no
            for (var j = 0; j < pacientes.length; j++) {
                if (pacientes[j].codigo_acceso == paciente.codigo_acceso) {
                    return res.status(404).json("Ya hay un paciente con dicho código de acceso");
                }
            }

            if (paciente.nombre == '' || paciente.fecha_nacimiento == '' || paciente.genero == '' || paciente.genero == 'Seleccione' || paciente.codigo_acceso == '') {
                res.status(404).json("Por favor, rellene los campos obligatorios (Nombre, fecha de nacimiento, genero, código de acceso)");
            } else {
                sqlNuevoPac = "INSERT INTO pacientes (nombre, fecha_nacimiento, genero, medico, codigo_acceso, observaciones) VALUES('" + paciente.nombre + "','" + paciente.fecha_nacimiento + "','" + paciente.genero + "','" + paciente.medico + "','" + paciente.codigo_acceso + "','" + paciente.observaciones + "')";
                conexion.query(sqlNuevoPac, function (errNuevoPac, pacienteNuevo) {
                    if (errNuevoPac) {
                        // console.error("Error en la inserción de datos del nuevo Paciente", errNuevoPac);
                        return res.status(500).json("Error al realizar la inserción del nuevo paciente");
                    } else {
                        return res.status(201).json(paciente);
                    }
                })
            }
        })
    })
});



// Utilizado para modificar los datos de un paciente en concreto --> Check
// URL 7, /api/paciente/:id --> Método put, actualiza los datos de un paciente
app.put("/api/paciente/:id", (req, res) => {

    //Id del paciente.
    var id = req.params.id;
    var nombre = req.body.nombre;
    var fecha_nacimiento = req.body.fecha_nacimiento;
    var genero = req.body.genero;
    var medico = req.body.medico;
    var codigo_acceso = req.body.codigo_acceso;
    var observaciones = req.body.observaciones;

    var sqlPac = "select * from pacientes";
    var sqlPacMod = "UPDATE pacientes SET nombre = '"
        + nombre + "', fecha_nacimiento = '"
        + fecha_nacimiento + "', genero ='"
        + genero + "', medico = '"
        + medico + "', codigo_acceso = '"
        + codigo_acceso + "', observaciones = '"
        + observaciones + "' WHERE id = " + id;
    var sqlPacModBus = "select * from pacientes where id='" + id + "'";

    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlPac, function (err, pacientes) {
        if (err) {
            return res.status(500).json("Error en la recuperación de datos");
        }
        else {
            // console.log(pacientes)
            // Para comprobar si hay algún paciente con el código de acceso y que no sea el mismo paciente
            for (var j = 0; j < pacientes.length; j++) {
                if (pacientes[j].codigo_acceso == codigo_acceso && id != pacientes[j].id) {
                    return res.status(404).json("Ya hay un paciente con dicho código de acceso");
                }
            }

            // Los campos han de estar rellenados.
            if (nombre == '' || fecha_nacimiento == '' || genero == '' || codigo_acceso == '' || medico == '') {
                return res.status(404).json("Por favor, rellene todos los campos obligatorios")
            }

            else {
                conexion.query(sqlPacMod, function (errPacMod, pacienteMod) {
                    if (errPacMod) {
                        // console.error("Error en la actualización de datos", errPacMod);
                        return res.status(500).json("Error en la actualización de datos");
                    } else {
                        conexion.query(sqlPacModBus, function (errPacModBus, pacienteModBus) {
                            if (errPacModBus) {
                                return res.status(500).json("Error en la obtención de los datos del paciente");
                            } else {
                                // console.log(pacienteModBus)
                                return res.status(200).json(pacienteModBus);
                            }
                        })
                    }
                })
            }
        }
    });
})

// Utilizado para obtener todas las muestras de ese paciente --> Check
// URL 8, /api/paciente/:id/muestras --> Método get, obtiene todas las muestras de ese paciente
app.get("/api/paciente/:id/muestras", (req, res) => {
    var id = req.params.id;
    // Ordenados por variable las muestras para que se muesten ordenadas en el main
    var sqlMue = "select * from muestras where paciente = '" + id + "' order by variable";
    // Enviamos una sentencia de mysql con un callback que nos van a dar el error o los datos
    conexion.query(sqlMue, function (err, muestrasPaciente) {
        if (err) {
            return res.status(500).json("Error en la recupación de datos");
        }
        if (muestrasPaciente.length != 0) {
            return res.status(200).json(JSON.parse(JSON.stringify(muestrasPaciente)));
        } else {
            return res.status(404).json("Dicho paciente no tiene muestras asociadas");
        }
    });
});



// Donde he modificadooo
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 

// 
// 

// 
// 
// 
// 
// 

app.put("/api/hospitales/director/:id", (req,res)=>{
    // El id del hospital a que quiero cambiar.
    // Este id es el id del hospital
    var id = req.params.id;

    // Tengo que indicar el número del director a que quiero reemplazar
    // Ejecutar en postman!!!!
    // Con que lo ejecutes en postman y señales en la base de datos ya estaría hecho!!!
    // Tienes que tener unos datos en la base de datos: un id un nombre y un director
    // Ejemplo: 1, hospital de valencia, 2
    // Pues en postman lo pones en put, pones la url indicando el id como 1 a ese hospital.
    // Ejemplo: http://localhost:8080/api/hospitales/director/1 <-- este id es el del hospital
    // Luego pones en el body:
    // {"director": 3}
    // Y ejecutas, y verás que se te cambia en la base de datos.
    conexion.query("update hospitales set director = "+ req.body.director +" where id = "+ id +" ", function(err, modificado){
        if (err) {
            return res.status(500).json("Error en la actualización de datos");
        } else {
            return res.status(200).json("Correcto");
        }
    })
})

// app.post("/api/paciente/:id/duplicar", (req, res) => {
//     var id = req.params.id;


//     conexion.query("select * from pacientes where id = " + id, function (err, pacienteADuplicar) {
//         if (err) {
//             return res.status(500).json("Error en la recuperación de datos");
//         } else {
//             conexion.query("insert into pacientes (nombre,fecha_nacimiento,genero,medico,codigo_acceso,observaciones) values('" + pacienteADuplicar[0].nombre + "','" + pacienteADuplicar[0].fecha_nacimiento + "','" + pacienteADuplicar[0].genero + "','" + pacienteADuplicar[0].medico + "','" + pacienteADuplicar[0].codigo_acceso + "','" + pacienteADuplicar[0].observaciones + "')", function (err2, pacienteDuplicar) {
//                 if (err2) {
//                     return res.status(500).json("Error en la inserción de datos");
//                 }else{
//                     console.log(pacienteDuplicar);
//                     return res.status(200).json("Correcto");
//                 }
//             })
//         }
//     })
// })
// Preparando para el examen:
// Método get
// app.get("/api/", (req, res) => {
// 
// })

// Método post
// app.post("/api/", function(req,res){

// })

// Método delete
// app.delete("/api/", (req, res) => {

// })

// Método put
// app.put("/api/", (req, res) => {

// })

// La aplicación escucha en el puerto 8080
app.listen(8080);