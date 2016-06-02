//Requires
var connect = require('connect')
//var https = require('https')
var https = require('http')
var parse = require('url').parse;
var path = require('path');
var favicon = require('serve-favicon');
var fs = require('fs');
var mime = require('mime');
var nodemailer = require('nodemailer');

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
app.use(favicon(__dirname + '/protected/img/ico.png'));

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

    var home = g_root + "/protected/";
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
    else if (req.url == "/" || req.url == "/index.html")
    {
        utilities.servefile(res, path.join(home, "index.html"));
    }
    else
    {
        var url_parts = parse(req.url, true);
        var query = url_parts.query;
        
        utilities.logFile("filename: " + filename);
        utilities.logFile("ext: " + path.extname(filename).toUpperCase());
        
        if (path.extname(filename).toUpperCase() == ".HTML" && filename.indexOf("EMB_") == -1)
        {
            //Hemos de emmbeberlo en un menú?            
            if (filename.indexOf("@@MENU@@") != -1)
            {
                //Está logeado?
                var logOk = false; 
                var sk = query.SESSIONKEY;
                
                if (sk != undefined && bbdd.keyExists(sk))
                {
                    utilities.servefileembeded(res, filename);
                }
                else
                {
                    utilities.servefile (res, "./404.html")
                }
            }
            else
            {
                //utilities.servefile(res, filename);
                //Está logeado?
                var logOk = false; 
                var sk = query.SESSIONKEY;
                
                if (sk != undefined && bbdd.keyExists(sk))
                {
                    utilities.servefile(res, filename);
                }
                else
                {
                    utilities.servefile (res, "./404.html")
                }
            }
        }
        //Si no, lo servimos como un fichero normnal
        else
        {
            utilities.servefile(res, filename);
        }
    }
});

//INICIO NODEMAILER
var smtpConfig =
{
    host: 'shx16.guebs.net',
    port: 25 ,//587 465, 25
    //secure: false,
    auth: {
        user: 'no-reply@go.maoni.solutions',
        pass: '4rfgtdidn6238e'
    }
};

var transporter = nodemailer.createTransport(smtpConfig);

transporter.verify(function(error, success)
{
   if (error)
   {
        utilities.logFile(error);
   }
   else
   {
        utilities.logFile('Server is ready to take our messages');
   }
});

function sendEmail (rowid, to, subject, html, callback)
{
    var mailOptions = 
    {
        from:       'no-reply@go.maoni.solutions',
        to:         to,//'xcastv@gmail.com',//to,
        subject:    'Maoni survey',
        html:       html
    };
    
    transporter.sendMail(mailOptions, function(error, info)
    {
        if (error)
        {
            utilities.logFile('error: ' + error);
        }
        else
        {
            utilities.logFile('Message sent: ' + info.response);
        }
        
        callback (error, rowid);
    });
}
//FIN NODEMAILER

function todatToyyyymmdd_hhmmss()
{
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    
    h = date.getHours(), 
    m = date.getMinutes(), 
    s = date.getSeconds();

    var yyyy = date.getFullYear();
    if(dd<10)
    {
        dd='0'+dd
    } 
    if(mm<10)
    {
        mm='0'+mm
    } 
    return yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + m + ':' + s;
}
        
function enviarMails()
{
    utilities.logFile("INICIO ENVIO EMAILS....");
    
    //Bucle de empresas
    bbdd.sel_all_from_empresas (function (err, data1)
    {
        if(data1 != undefined)
        {
            for (var i = 0; i < data1.length; i++)
            {
                utilities.logFile(data1[i].IDEMPRESA + " " + data1[i].DESCEMPRESA);
                
                //Bucle de hoteles de empresa
                bbdd.sel_all_from_hoteles (data1[i].IDEMPRESA ,function (err, data2)
                {
                    for (var j = 0; j <data2.length; j++)
                    {
                        utilities.logFile("  " + data2[j].IDHOTEL + " " + data2[j].DESCHOTEL);
                        
                        //Bucle de encuestas
                        bbdd.sel_all_from_parametrosMailing (data2[j].IDHOTEL ,function (err, data3)
                        {
                            for (var k = 0; k <data3.length; k++)
                            {
                                utilities.logFile("    " + data3[k].IDIOMA + " " + data3[k].PATH);
                                
                                //Inmail
                                if (data3[k].TIPO == 2)
                                {
                                    var IdEncuesta = data3[k].IDENCUESTA;
                                    
                                    //Hora del sistema
                                    var d = new Date();
                                    var hh = d.getHours();
                                    
                                    //Si podemos enviar la encuesta
                                    if (hh >= data3[k].HORAINICIO && hh <= data3[k].HORAFIN)
                                    {
                                        //Vamos a buscar reservas que cumplan:
                                        //
                                        // * Que sean del idioma de la encuesta
                                        // * Que no se haya enviado ya el premail
                                        // * Que lleven parametrosMailing.DIAS alojados o que ya hayan salido
                                        //Bucle de encuestas
                                        bbdd.sel_all_from_reservasImMail (data3[k].IDHOTEL, data3[k].DIAS, data3[k].IDIOMA, function (err, data4)
                                        {
                                            var step1 = function (x)
                                            {
                                                if (x < data4.length)
                                                {
                                                    utilities.logFile("      EMAIL TO: " + data4[x].MAIL_CARDEX);
                                            
                                                    //Preparamos la encuesta
                                                    var menufilename = __dirname + "/public/mails/inmail_" + data4[x].ISO_IDIOMA + ".html";
                                                    
                                                    fs.stat(menufilename, function (errf, stat)
                                                    {
                                                        if (!errf)
                                                        {
                                                            sbuffer = fs.readFileSync(menufilename, "utf8");
                                                            
                                                            var shotel = "";
                                                            var IdHotel = data4[x].IDHOTEL;
                                                            for (var ht = 0; ht < data2.length; hy++)
                                                            {
                                                                if (data2[ht].IDHOTEL == data4[x].IDHOTEL)
                                                                {
                                                                    shotel = data2[ht].DESCHOTEL;
                                                                    break;
                                                                }
                                                            }
                                                            
                                                            var body = sbuffer.replaceAll("@@NOMBRECOMPLEJO@@", shotel);
                                                            body = body.replaceAll("@@ROWID@@", data4[x].ROWID);
                                                            body = body.replaceAll("@@IDHOTEL@@", IdHotel);
                                                            body = body.replaceAll("@@IDRESERVA@@", data4[x].IDRESERVA);
                                                            body = body.replaceAll("@@IDENCUESTA@@", IdEncuesta);
                                                            body = body.replaceAll("@@IDIOMA@@", data4[x].ISO_IDIOMA);
                                                            body = body.replaceAll("@@NOMBRE@@", data4[x].NOMBRE);
                                                            body = body.replaceAll("@@APELLIDO1@@", data4[x].APELLIDO1);
                                                            body = body.replaceAll("@@APELLIDO2@@", data4[x].APELLIDO2);
                                                            
                                                            sendEmail (data4[x].ROWID, data4[x].MAIL_CARDEX, "ENCUESTA", body, function (err, rowid)
                                                            {
                                                                if (err == null)
                                                                {
                                                                    bbdd.update_generico ("gomaonis_maonibd.reservas", rowid, "SI_IN_ENVIADO", 1, function(err,data)
                                                                    {
                                                                    });
                                                                    bbdd.update_generico ("gomaonis_maonibd.reservas", rowid, "FECHAINENVIADO", todatToyyyymmdd_hhmmss(), function(err,data)
                                                                    {
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });

                                                    step1(x + 1);
                                                }
                                            };

                                            step1 (0);                                            
                                        });
                                    }
                                }
                            }                        
                        });
                    }
                });
            }
        }
    });
    
    setTimeout (enviarMails, 1000 * 60 * 30); // 30 minutos
}

enviarMails();

// ----------------------------------------------------------------------------------------------------------------------

function notificarIncidencias()
{
    utilities.logFile("INICIO NOTIFICAR INCIDENCIAS....");
    //Bucle de empresas
    bbdd.sel_incidenciasNoNotificadas (function (err, data1)
    {
        if(data1 != undefined)
        {
            //Preparamos la notificación
            var menufilename = __dirname + "/public/mails/notificacion.html";
            
            var step1 = function (x)
            {
                if (x < data1.length)
                {
                    utilities.logFile("INCIDENCIA: " + data1[x].ROWID);
                    
                    fs.stat(menufilename, function (errf, stat)
                    {
                        if (!errf)
                        {
                            sbuffer = fs.readFileSync(menufilename, "utf8");                        
                            
                            var fecha = utilities.formatearFecha(data1[x].FECHACREACION);
                            
                            var body = sbuffer.replaceAll("@@DESCHOTEL@@",data1[x].DESCHOTEL);
                            body = body.replaceAll("@@ROWID@@", data1[x].ROWID);
                            body = body.replaceAll("@@FECHA@@", fecha);
                            body = body.replaceAll("@@IDRESERVA@@", data1[x].IDRESERVA);
                            body = body.replaceAll("@@TIPOCOMENTARIO@@", data1[x].NOMBRETIPO);
                            body = body.replaceAll("@@DESCRIPCION@@", data1[x].DESCRIPCION);
                            
                            sendEmail (data1[x].ROWID, data1[x].EMAIL, "VALORACIÓN NEGATIVA: " + data1[x].ROWID, body, function (err, rowid)
                            {
                                if (err == null)
                                {
                                    bbdd.update_generico ("gomaonis_maonibd.Incidencias", rowid, "NOTIFICADAAUSUARIO", 1, function(err,data)
                                    {
                                    });
                                }
                            });
                        }
                        
                        step1(x + 1);
                    });
                    
                }
            };
            step1 (0);
            
        }
    });
    
    setTimeout (enviarMails, 1000 * 60 * 5); // 5 minutos
}

notificarIncidencias();

//https://localhost:4000
var mess = "INICIO maoni. Escuchando en el puerto: " + g_port;

utilities.logFile(mess);

//https.createServer(options, app).listen(g_port);
https.createServer(app).listen(g_port);

