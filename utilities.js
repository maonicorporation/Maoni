var fs = require('fs');
var mime = require('mime');
var path = require('path');

function servefile(res, filename)
{
    //Verificar que el fichero exista
    fs.stat(filename, function (err, stat)//
    {
        if (err)
        {
            console.dir("Fichero no encontrado : " + filename);
            
            if ('ENOENT' == err.code)
            {
                res.statusCode = 404;
                res.end('Not Found');
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