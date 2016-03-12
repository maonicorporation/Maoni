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
    database : 'maoni'
});

//Hash de funciones
var handle = {};

handle["version"] = version;
handle["sel_all_from_empresas"] = sel_all_from_empresas;
handle["sel_all_from_users"] = sel_all_from_users;

function redirecciona(req, res)
{
    var jsonString = '';

    req.on('data', function (data)
    {
        jsonString += data;
        
    });
    req.on('end', function ()
    {
        var params = JSON.parse(jsonString);
        
        var mess = params.f + " -> " + jsonString;
        utilities.logFile(mess);

        handle[params.f](req, res, params, function (err, ret)
        {
            res.end (ret);
        });
    });
}

exports.redirecciona = redirecciona;

/**********************************************************************************************************************/

function version (req, res, params, callback)
{
    callback (null, "version: 1.0");
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