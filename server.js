//Requires
var connect = require('connect')
//var https = require('https')
var https = require('http')
var parse = require('url').parse;
var path = require('path');
var favicon = require('serve-favicon');
var fs = require('fs');
var mime = require('mime');
var utilities = require("./utilities");
var bbdd = require("./bbdd");

//Globals
var g_root = __dirname;
var g_port = 5555;
var g_hour = 3600000;

var app = connect();

////Cesrtificado SSL
var options = {
    //pfx: fs.readFileSync('./ssl/private.pfx'),// -> Se ha de generar desde el servidor, pide una pass
    //passphrase: 'fridakalo'
};

//Connect components
app.use(favicon(__dirname + '/public/img/ico.png'));

var compression = require('compression');
app.use(compression())

var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['57ADE7EDDCE77A69D94F7CF6B3F65', 'C99C1ED5A96DCC8CB47A95F73F97F'],
    cookie: { maxAge: g_hour * 24, secure: true }
}));

app.use(function (req, res)
{
    //dotest();

    var home = g_root + "/public/";
    var url = parse(req.url);
    var filename = path.join(home, url.pathname);
    var logOk = false;
    
    if (req.session.loggedin != null && req.session.loggedin) logOk = true;
    
    //Acción o servir ficheros?
    utilities.logFile("Request file: " + req.url);
    
    if (req.url == "/BBDD")
    {
        bbdd.redirecciona(req, res);
    }
    else if (req.url == "/")
    {
        utilities.servefile(res, path.join(home, "index.html"));
    }
    else
    {
        //Servir los ficheros, si logged in
        var logOk = true;
        if (logOk || path.extname(filename) == ".html")
        {
            //Hemos de emmbeberlo en un menú?            
            if (filename.indexOf("@@MENU@@") != -1)
            {
                utilities.servefileembeded(res, filename);
            }

            //Si no, lo servimos como un fichero normnal
            else
            {
                utilities.servefile(res, filename);
            }
        }

        //Si no se ha logeado, servimos la pantalla de login
        else
        {
            utilities.servefile (res, path.join(home, "index.html"));
        }
    }
});

//https://localhost:4000
var mess = "INICIO maoni. Escuchando en el puerto: " + g_port;

utilities.logFile(mess);

//https.createServer(options, app).listen(g_port);
https.createServer(app).listen(g_port);

