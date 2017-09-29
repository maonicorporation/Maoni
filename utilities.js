var fs = require('fs');
var mime = require('mime');
var path = require('path');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function logFile(mess)
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    
    var fmess = h + ":" + m + ":" + s + "\t" + mess + "\n";
    var fmess2 = h + ":" + m + ":" + s + " " + mess;
    
    var fpath = __dirname + "/logs/" + "log" + yyyy + "-" + mm + "-" + dd + ".log";
    
    fs.appendFile(fpath, fmess, function (err)
    {        
    });
    console.dir(fmess2);
}

function servefile (res, filename)
{
    //Verificar que el fichero exista
    fs.stat(filename, function (err, stat)//
    {
        if (err)
        {
            console.dir("Fichero no encontrado : " + filename);
            
            if ('ENOENT' == err.code)
            {
                //res.statusCode = 404;
                //res.end('Not Found');
                servefile (res, "./404.html")
            }
            else
            {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } 
        else
        {
            res.setHeader('Content-Length', stat.size);
            var mimetype = mime.lookup(path.basename(filename));
            res.setHeader('content-type', mimetype);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control','no-cache');
            
            var stream = fs.createReadStream(filename);
            stream.pipe(res);
            stream.on('error', function (err)
            {
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
        }
    });
}

//Buffer menu principal
var g_buff_MENU = "";

function servefileembeded(res, filename)
{
    var root = path.dirname(filename);

    //descomentar en release: if (g_buff_MENU == "")
    {
        var menufilename = root + "/main.html";
        g_buff_MENU = fs.readFileSync(menufilename, "utf8");
    }
    
    if (g_buff_MENU != "")
    {
        //Verificar que el fichero exista
        fs.stat(filename, function (err, stat)
        {
            if (!err)
            {
                var newContent = g_buff_MENU.replace("@@EMBEDED@@", fs.readFileSync(filename, "utf8"));

                res.setHeader('Content-Length', newContent.length);
                var mimetype = mime.lookup(path.basename(filename));
                res.setHeader('content-type', mimetype);
                
                res.end(newContent);
            }
            else
            {
                res.end();
            }
        });
    }
    else
    {
        res.end();
    }
}

function formatearFecha(fecha_actual)
{
    var nombres_dias = new Array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
    var nombres_meses = new Array('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre');

    dia_mes = fecha_actual.getDate() //dia del mes
    dia_semana = fecha_actual.getDay() //dia de la semana
    mes = fecha_actual.getMonth() + 1
    anio = fecha_actual.getFullYear()

    var fechaHora = new Date();
    var horas = fechaHora.getHours();
    var minutos = fechaHora.getMinutes();
    var segundos = fechaHora.getSeconds();
    var sufijo = 'AM';

    if(horas > 12)
    {
        horas = horas - 12;
        sufijo = 'PM';
    }

    if(horas < 10) { horas = '0' + horas; }
    if(minutos < 10) { minutos = '0' + minutos; }
    if(segundos < 10) { segundos = '0' + segundos; }
    
    return nombres_dias[dia_semana] + ', ' + dia_mes + ' de ' + nombres_meses[mes - 1] + ' de ' + anio + ', ' + horas + ':' + minutos + ' ' + sufijo;
}

exports.servefile = servefile;
exports.servefileembeded = servefileembeded;
exports.logFile = logFile;
exports.formatearFecha = formatearFecha;