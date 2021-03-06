var utilities = require("./utilities");
var config = require('./bbdd_config');

//MySQL
var db = require('node-mysql');
var cps = require('cps');
var DB = db.DB;
var BaseRow = db.Row;
var BaseTable = db.Table;

var box = new DB({
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database,
    timezone : 'utc'
});

/**********************************************************************************************************************/

//Generador de keys
function random (low, high)
{
    return Math.floor(Math.random() * (high - low) + low);
}

function getkey ()
{
    return random (1, 1000000);
}

var KEYS = []
KEYS.push (7604320);//DEBUG

function keyExists (key)
{
    var i = KEYS.indexOf(parseInt(key));
    return i > -1;
}

function redirecciona(req, res)
{
    var jsonString = '';

    req.on('data', function (data)
    {
        jsonString += data;
        
    });
    req.on('end', function ()
    {
        if(jsonString.trim() != "")
        {
            var params = JSON.parse(jsonString);
            
            var mess = params.f + " -> " + jsonString;
            utilities.logFile(mess);

            handle[params.f](req, res, params, function (err, ret)
            {
                res.setHeader('Content-Length', ret.length);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            
                res.end (ret);
            });
        }  
        else
        {
            res.end ();
        }          
    });
}

exports.redirecciona = redirecciona;
exports.keyExists = keyExists;

/**********************************************************************************************************************/

//Hash de funciones de bbdd
var handle = {};

handle["version"] = version;
handle["login"] = login;
handle["sel_all_from_empresas"] = sel_all_from_empresas;
handle["sel_all_from_users"] = sel_all_from_users;

function version (req, res, params, callback)
{
    callback (null, "version: 1.0");
}

function login (req, res, params, callback)
{
    var sentencia = "SELECT DESCUSUARIO FROM usuarios where IDUSUARIO = ? and PASSWORD = ?";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [params.user, params.pwd], callback);
            },
            function(res, cb) 
            {
                if (res.length == 1)
                {
                    var key = getkey();
                    res[0].SESSIONKEY = key;
                    KEYS.push(key);
                    callback (null, JSON.stringify (res));
                }
                else
                {
                    callback (null, "{}");
                }
            }
        ], callback);
    }, callback);
}

function sel_all_from_empresas (req, res, params, callback)
{
    var sentencia = "SELECT ROWID, IDEMPRESA, DESCEMPRESA FROM maoni.empresas";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                callback (null, JSON.stringify (res));
            }
        ], callback);
    }, callback);
}

function sel_all_from_users (req, res, params, callback)
{
    var sentencia = "SELECT ROWID, IDUSUARIO, DESCUSUARIO FROM usuarios";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                callback (null, JSON.stringify (res));
            }
        ], callback);
    }, callback);
}

/**********************************************/
//FUNCIONES INTERNAS DE BBDD

exports.sel_all_from_empresas = sel_all_from_empresas;
exports.sel_all_from_hoteles = sel_all_from_hoteles;
exports.sel_all_from_parametrosMailing = sel_all_from_parametrosMailing;
exports.sel_all_from_reservasInMail = sel_all_from_reservasInMail;
exports.sel_all_from_reservasPreMail = sel_all_from_reservasPreMail;
exports.update_generico = update_generico;
exports.update_usuario = update_usuario;
exports.get_usuario_by_email = get_usuario_by_email;
exports.get_usuario_by_email_codigo = get_usuario_by_email_codigo;
exports.sel_incidenciasNoNotificadas = sel_incidenciasNoNotificadas;
exports.insert_reservs_csv = insert_reservs_csv;
exports.sel_all_from_traducciones = sel_all_from_traducciones;

function update_generico (table, rowid, field, value, callback)
{
    var sentencia = "UPDATE " + table + " SET " + field + " = ? WHERE ROWID = ?";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [value, rowid], callback)
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function get_usuario_by_email (email, callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.usuarios where EMAIL = ?";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [email], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function get_usuario_by_email_codigo (email, codigo, callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.usuarios where EMAIL = ? and CODIGO = ?";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [email, codigo], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function update_usuario (email, field, value, callback)
{
    var sentencia = "UPDATE gomaonis_maonibd.usuarios SET " + field + " = ? WHERE EMAIL = ?";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [value, email], callback)
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function sel_all_from_empresas (callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.empresas where siactiva = 1";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function sel_incidenciasNoNotificadas (callback)
{
    var sentencia = "select * from gomaonis_maonibd.INCIDENCIAS_NO_NOTIFICADAS order by ROWID";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function sel_all_from_hoteles (idempresa, callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.hoteles where idempresa = ? and siactivo = 1";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [idempresa], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function sel_all_from_parametrosMailing (idhotel, callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.parametrosMailing where idhotel = ? and siactiva = 1";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [idhotel], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

//Vamos a buscar reservas que cumplan:
//
// * Que sean del idioma de la encuesta
// * Que no se haya enviado ya el premail
// * Que lleven parametrosMailing.DIAS alojados o que ya hayan salido

function sel_all_from_reservasPreMail (idhotel, diasAntelacion, idioma, callback)
{
    //SELECT DATE_ADD('2010-05-11', INTERVAL 1 DAY) AS Tomorrow;
    var sentencia = "SELECT * FROM gomaonis_maonibd.reservas where idhotel = ? and iso_idioma = ? and si_pre_enviado <> 1 and entrada <= DATE_ADD(CURDATE(), INTERVAL ? DAY) order by entrada asc";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [idhotel, idioma, diasAntelacion], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

//Vamos a buscar reservas que cumplan:
//
// * Que sean del idioma de la encuesta
// * Que no se haya enviado ya el inmail
// * Que lleven parametrosMailing.DIAS alojados o que ya hayan salido

function sel_all_from_reservasInMail (idhotel, diasAlojados, idioma, callback)
{
    //SELECT DATE_ADD('2010-05-11', INTERVAL 1 DAY) AS Tomorrow;
    var sentencia = "SELECT * FROM gomaonis_maonibd.reservas where idhotel = ? and iso_idioma = ? and si_in_enviado <> 1 and entrada <= DATE_ADD(CURDATE(), INTERVAL ? DAY) order by entrada asc";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, [idhotel, idioma, -diasAlojados], callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function insert_reservs_csv (csvrow, callback)
{
    //SELECT DATE_ADD('2010-05-11', INTERVAL 1 DAY) AS Tomorrow;
    var sentencia = "insert into gomaonis_maonibd.reservas (IDHOTEL,IDRESERVA,ENTRADA,SALIDA,MAIL_CARDEX,NOMBRE,APELLIDO1,APELLIDO2,ISO_PAIS,ISO_IDIOMA,HABITACION) values (?,?,?,?,?,?,?,?,?,?,?)";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, csvrow, callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}

function sel_all_from_traducciones (callback)
{
    var sentencia = "SELECT * FROM gomaonis_maonibd.traducciones;";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                callback (null, res);
            }
        ], callback);
    }, callback);
}