var db = require('node-mysql');
var cps = require('cps');
var DB = db.DB;
var BaseRow = db.Row;
var BaseTable = db.Table;

/*
var box = new DB({
    host     : 'localhost',
    user     : 'root',
    password : 'maonipass77',
    database : 'maoniBD'
});*/

/*
var box = new DB({
    host     : 'go.maoni.solutions',//'go.maoni.solutions' 52.16.112.227 localhost 7fa0877f.gclientes.com
    user     : 'gomaonis_root',
    password : 'maonipass77D1STURB3D',
    database : 'gomaonis_maonibd'
});*/

var box = new DB({
    host     : 'go.maoni.solutions',
    user     : 'gomaonis_Aleix',
    password : 'Aleix.2302',
    database : 'gomaonis_maonibd'
});

console.dir("A");
login (function cb(err, data){console.dir(data);});
console.dir("B");

function login (callback)
{
    var sentencia = "SELECT DESCUSUARIO FROM usuarios";
    
    box.connect(function(conn, callback)
    {
        cps.seq([
            function(_, callback)
            {
                conn.query (sentencia, callback);
            },
            function(res, cb) 
            {
                if (res.length == 1)
                {
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
