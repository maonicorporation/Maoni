var utilities = require("./utilities");

//MySQL
var db = require('node-mysql');
var cps = require('cps');
var DB = db.DB;
var BaseRow = db.Row;
var BaseTable = db.Table;

var box = new DB({
    host     : 'localhost',
    user     : 'root',
    password : 'maonipass77',
<<<<<<< HEAD
    database : 'maoniBD'
=======
    database : 'maonibd'
>>>>>>> dad02b42b77666b3dd09a7d7a281e2b25a360a62
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
                res.setHeader('Content-Type', 'application/json');
            
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
    var sentencia = "SELECT DESCUSUARIO FROM maonibd.usuarios where IDUSUARIO = ? and PASSWORD = ?";
   
    
    box.connect(function(conn, callback)//xparams.user, xparams.pwd DB.format('select * from users where id = ?' [userId]);
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
    var sentencia = "SELECT ROWID, IDUSUARIO, DESCUSUARIO FROM maoni.usuarios";
    
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

/*
function getpagospasarelapendientescontabilizar (user,empresa, tipo, callback)
{
    var sentencia = "";
    
    if (tipo == 1 || tipo == 2)
    {       
        sentencia = "Select ID, CODIGO_AUTORIZACION, NUM_TRANSACCION,year(fecha) as ANYO,month(fecha) as MES,day(fecha) as DIA, IMPORTE from GrupHotel.Pagos where codigo_autorizacion <> '' and datos_comercio = " + user + " and fecha > 20151101 order by fecha desc"; 
    }
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                var ret = [];
                if (res != undefined && res.length >= 1)
                {
                    res.forEach(function(element, index)
                    {
                    });
                }
                else
                {
                     callback (null, ret);
                }
            }
        ], callback);
    }, callback);
};*/