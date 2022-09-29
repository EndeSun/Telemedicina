var express = require("express");
var app = express();
app.use(express.json());

var mysql = require("mysql");
var database ={
    host:"localhost",
    user:"root",
    password:"",
    database :"hospitales",
    port:3306
};

var conexion = mysql.createConnection(database);
console.log("Conectando con la base de datos...");
conexion.connect(function(err){
    if(err){
        console.log("Se ha producido un error al conectar a la base de datos",err);
        process.exit();
    }else{
        console.log("Base de datos conectada correctamente!!!");
    }
});

app.get("/hola",function(req,res){
    console.log("Hola!!");
    res.json("Hola Mundo!!");
});

app.get("/hospitales", function(req,res){
    var sql = "SELECT * FROM hospital";
    conexion.query(sql,function(err,hospi){
        if(err){
            console.log("Error al realizar la select",err);
            res.status(500).json("Error al realizar la consulta");
        }else{
            console.log("Hospitales:",hospi);
            res.json(hospi);
        }
   });
});

app.get("/hospitales/:id",function(req,res){
    var idHospital = req.params.id;
    var sql = "SELECT * FROM hospital WHERE id = " + idHospital;
    conexion.query(sql,function(err,hos){
        if(err){
            console.log("Error al realizar la select",err);
            res.status(500).json("Error al realizar la consulta");
        }else{
            if(hos.length ===1){
                console.log("Hospital:",hos[0]);
                res.status(200).json(hos[0]);
            }else{
                console.log("No se ha encontrado el hospital con id:",idHospital);
                res.status(404).json("No se han encontrado el hospital");
            }
        }
    });
});


app.get("/hospitalesCiudad/:idCiudad",function(req,res){
    var idCiudad = req.params.idCiudad;
    var sql = "SELECT * FROM hospital WHERE ciudad = " + idCiudad;
    console.log(idCiudad)
    conexion.query(sql,function(err,hos){
        if(err){
            console.log("Error al realizar la select",err);
            res.status(500).json("Error al realizar la consulta");
        }else{
            if(hos.length >=1){
                
                console.log("Hospitales:",hos);
                res.status(200).json(hos);
            
            }else{
                console.log("No se ha encontrado el hospital con id:",idHospital);
                res.status(404).json("No se han encontrado el hospital");
            }
        }
    });
});




app.post("/hospitales", function (req, res) {
    var hospital = req.body;
    // VALUES('otrohospital','otradireccion','otrotelefono')
    var sql = "INSERT INTO hospital (nombre, direccion, pais, telefono, color, ciudad) VALUES('" + hospital.nombre + "','" + hospital.direccion + "', '" + hospital.pais + "', '" + hospital.telefono + "','" + hospital.color + "','" + hospital.ciudad + "')";
    conexion.query(sql, function (err, resultado) {
        if (err) {
            console.log("Error al realizar el insert", err);
            res.status(500).json("Error al realizar la insercion");
        } else {
            console.log("Hospital insertado:", resultado);
            res.status(201).json(resultado.insertId);
        }
    });
});

app.delete("/hospitales/:id",function(req,res){
    var sql = "DELETE FROM hospital WHERE id = " + req.params.id;
    conexion.query(sql,function(err,resultado){
        if(err){
            console.log("Error al realizar el delete",err);
            res.status(500).json("Error al realizar el borrado");
        }else{
            console.log("Hospital borrado:",resultado);
            res.status(200).json("Hospital eliminado");
        }
    });
});

app.put("/hospitales/:id",function(req,res){
    var sql = "UPDATE hospital SET nombre = '"
    +req.body.nombre + "', direccion = '"
    +req.body.direccion + "', pais = '"
    +req.body.pais + "', telefono = '"
    +req.body.telefono + "', color = '"
    +req.body.color + "', ciudad = '"
    +req.body.ciudad + "' WHERE id = " + req.params.id;
conexion.query(sql,function(err,resultado){
    if(err){
        console.log("Error al realizar el update",err);
        res.status(500).json("Error al realizar la actualización");
    }else{
        console.log("Hospital actualizado:", resultado);
        res.status(200).json("Hospital actualizado");
    }
});
});

app.listen(5000, function(){
    console.log("Servidor de ejemplo en el puerto 5000");
});