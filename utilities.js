var fs = require('fs');
var mime = require('mime');
var path = require('path');

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
        console.dir(fmess2);
    });
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

exports.servefile = servefile;
exports.servefileembeded = servefileembeded;
exports.logFile = logFile;