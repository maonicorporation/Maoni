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
var csvparse = require('csv-parse');
var utilities = require("./utilities");
var bbdd = require("./bbdd");
var config = require('./bbdd_config');
var formidable = require('formidable');
var util = require('util');

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

    var home = path.join(g_root, "/protected/");
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
    else if (req.url == "/FUNC")
    {
        redireccionaFunc(req, res);
    }
    else if (req.url.toLowerCase() == '/upload' && req.method.toLowerCase() == 'post') 
    {
        try
        {
            var idhotel = -1;

            var form = new formidable.IncomingForm();
        
            form.parse(req, function(err, fields, files)
            {
                utilities.logFile(util.inspect({fields: fields, files: files}));

                //res.writeHead(200, {'content-type': 'text/plain'});
                //res.write('received upload:\n\n');
                //res.end(util.inspect({fields: fields, files: files}));
            });
            form.on('field', function (field, value)
            {
                if (field == "idhotel")
                {
                    idhotel = value;
                }
                utilities.logFile(field);
                utilities.logFile(value);
            });
            form.on('file', function (name, file)
            {
                utilities.logFile(name);
                utilities.logFile(file);
            });
            form.on('end', function ()
            {   
                try
                {

                    //https://csv.adaltas.com/parse/examples/
                    var src = path.join(form.openedFiles[0].path, form.openedFiles[0].name);

                    //res.writeHead(200, {'content-type': 'text/plain'});
                    //res.write('received upload:');

                    fs.readFile (src, 'utf8', function (err, data)
                    {
                        if (err)
                        {
                            utilities.logFile(err);
                            res.end("ERROR fichero: " + err);
                        }
                        else
                        {                            
                            csvparse(data, {comment: '#', delimiter:','}, function(err, output)
                            {
                                function dobucle (x)
                                {
                                    if (x < output.length)
                                    {
                                        output[x].splice(0, 0, idhotel);
                                        bbdd.insert_reservs_csv (output[x], function(err)
                                        {
                                            dobucle (x+1);
                                        });
                                    }
                                }

                                dobucle(0);

                                utilities.logFile(output);
                            });

                            res.end("OK fichero: " + data);
                        }
                    });
                }
                catch (err)
                {
                    utilities.logFile(err);
                    res.end("error gordo: " + err);
                }    
            });    
        }
        catch (err)
        {
            utilities.logFile(err);
        }    
    }
    else if (req.url == "/" || req.url == "/index.html")
    {
        utilities.servefile(res, path.join(home, "index.html"));
    }
    else if ( req.url == "/changepwd.html")
    {
        utilities.servefile(res, path.join(home, "changepwd.html"));
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

function redireccionaFunc(req, res)
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
                res.end(ret);
            });
        }  
        else
        {
            res.end ();
        }          
    });
}

//Hash de funciones
var handle = {};

handle["version"] = function(req, res, params, callback)
{
    callback (null, JSON.stringify({"version": "1.0"}));
}

handle["sendCode"] = function(req, res, params, callback)
{
    var makeid = function (l)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < l; i++)
        {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
      
        return text;
    };

    var email = params.email;
    var subject = "MAONI - CAMBIO DE CONTRASEÑA";
    var codigo = makeid (16);
    var body = "Copie el siguiente código y péguelo, para continuar con el proceso de <u>CAMBIO DE CONTRASEÑA</u><br/><br/>";
    body += "<h3><b>" + codigo + "</b></h3><br/>";

    //Existe el usuario?
    bbdd.get_usuario_by_email (email, function(err, data)
    {
        if(err == null && data.length == 1)
        {
            //Enviamos el código por email
            sendEmail ("1000", email, subject, body, function(err, data)
            {
                //Si todo va bien, anotamos el código en la ficha del usuario
                if (err == null)
                {
                    bbdd.update_usuario (email, "CODIGO", codigo, function (err, data)
                    {
                        callback (err, JSON.stringify({'RESULT': 1}));
                    });
                }
                else
                {
                    callback ("error al enviar email", JSON.stringify({'RESULT': 0}));
                }
            });
        }
        else
        {
            callback ("error usuario no existe", JSON.stringify({'RESULT': 0}));
        }
    });
}

handle["cambiarPwd"] = function(req, res, params, callback)
{
    //var params = { f: "cambiarPwd", email: email, code: code, pwd: pwd };

    //Existe el código?
    bbdd.get_usuario_by_email_codigo (params.email, params.codigo, function(err, data)
    {
        if(err == null && data.length == 1)
        {
            //Reseteamos el código
            bbdd.update_usuario (params.email, "CODIGO", '', function (err, data)
            {
                //Actualizamos pwd
                bbdd.update_usuario (params.email, "PASSWORD", params.pwd, function (err, data)
                {
                    callback (err, JSON.stringify({'RESULT': 1}));
                });   
            });                
        }
        else
        {
            callback ("error usuario no existe", JSON.stringify({'RESULT': 0}));
        }
    });
}

//INICIO NODEMAILER
var smtpConfig =
{
    host: 'shx16.guebs.net',
    port: 25 ,//587 465, 25
    //secure: false,
    auth: {
        user: 'no-reply@go.maoni.solutions',
        pass: config.emailpwd
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
    bbdd.sel_all_from_traducciones (function (err, dataTrans)
    {
        function translate (b, idioma)
        {
            var ret = b;
            for (var i = 0; i < dataTrans.length; i++)
            {
                var col = "TEXT_" + idioma;
                var key = "@@" + dataTrans[i].KEY + "@@";
                var trans = dataTrans[i][col];
                ret = ret.replaceAll(key, trans);
            }

            return ret;
        }

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
                                    
                                    //Premail
                                    if (data3[k].TIPO == 1)
                                    {
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
                                            
                                            contextOfK (k);

                                            function contextOfK(contextualized_k)
                                            {
                                                var filePath = data3[contextualized_k].PATH;

                                                bbdd.sel_all_from_reservasPreMail (data3[contextualized_k].IDHOTEL, data3[contextualized_k].DIAS, data3[contextualized_k].IDIOMA, function (err, data4)
                                                {
                                                    var step1 = function (x)
                                                    {
                                                        if (x < data4.length)
                                                        {
                                                            utilities.logFile("      PREMAIL TO: " + data4[x].MAIL_CARDEX);
                                                    
                                                            //Preparamos la encuesta
                                                            var filename = path.join(__dirname , "public/mails/pre");
                                                            filename = path.join(filename , filePath);
                                                            
                                                            fs.stat(filename, function (errf, stat)
                                                            {                                                        
                                                                if (!errf)
                                                                {
                                                                    var sbuffer = fs.readFileSync(filename, "utf8");
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
                                                                            bbdd.update_generico ("gomaonis_maonibd.reservas", rowid, "SI_PRE_ENVIADO", 1, function(err,data)
                                                                            {
                                                                            });
                                                                            bbdd.update_generico ("gomaonis_maonibd.reservas", rowid, "FECHAPREENVIADO", todatToyyyymmdd_hhmmss(), function(err,data)
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

                                    //Inmail
                                    else if (data3[k].TIPO == 2)
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

                                            contextOfK (k);
                                            
                                            function contextOfK(contextualized_k)
                                            {
                                                var filePath = data3[contextualized_k].PATH;

                                                bbdd.sel_all_from_reservasInMail (data3[contextualized_k].IDHOTEL, data3[contextualized_k].DIAS, data3[contextualized_k].IDIOMA, function (err, data4)
                                                {
                                                    var step1 = function (x)
                                                    {
                                                        if (x < data4.length)
                                                        {
                                                            utilities.logFile("      EMAIL TO: " + data4[x].MAIL_CARDEX);
                                                    
                                                            //Preparamos la encuesta
                                                            var filename = path.join(__dirname , "public/mails/in");
                                                            filename = path.join(filename , filePath);
                                                            
                                                            fs.stat(filename, function (errf, stat)
                                                            {
                                                                if (!errf)
                                                                {
                                                                    var sbuffer = fs.readFileSync(filename, "utf8");
                                                                    
                                                                    sbuffer = translate (sbuffer, data3[contextualized_k].IDIOMA);

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
                                }                        
                            });
                        }
                    });
                }
            }
        });
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
            var menufilename = path.join(__dirname, "/public/mails/notificacion_ES_A.html");
            
            var step1 = function (x)
            {
                if (x < data1.length)
                {
                    utilities.logFile("INCIDENCIA: " + data1[x].ROWID);
                    
                    fs.stat(menufilename, function (errf, stat)
                    {
                        if (!errf)
                        {
                            var sbuffer = fs.readFileSync(menufilename, "utf8");                        
                            
                            var fecha = utilities.formatearFecha(data1[x].FECHACREACION);
                            
                            var body = sbuffer.replaceAll("@@DESCHOTEL@@",data1[x].DESCHOTEL);
                            body = body.replaceAll("@@ROWID@@", data1[x].ROWID);
                            body = body.replaceAll("@@FECHA@@", fecha);
                            body = body.replaceAll("@@IDRESERVA@@", data1[x].IDRESERVA);
                            body = body.replaceAll("@@TIPOCOMENTARIO@@", data1[x].NOMBRETIPO);
                            body = body.replaceAll("@@DESCRIPCION@@", data1[x].DESCRIPCION);
                            body = body.replaceAll("@@HABITACION@@", data1[x].HABITACION);
                            body = body.replaceAll("@@NOMBRE@@", data1[x].NOMBRE);
                            body = body.replaceAll("@@APELLIDO1@@", data1[x].APELLIDO1);
                            
                            sendEmail (data1[x].ROWID, data1[x].EMAIL, "VALORACIÓN NEGATIVA: " + data1[x].ROWID, body, function (err, rowid)
                            {
                                if (err == null)
                                {
                                    /*bbdd.update_generico ("gomaonis_maonibd.Incidencias", rowid, "NOTIFICADAAUSUARIO", 1, function(err,data)
                                    {
                                    });*/
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

//notificarIncidencias();

// ----------------------------------------------------------------------------------------------------------------------

var mess = "INICIO maoni. Escuchando en el puerto: " + g_port;

utilities.logFile(mess);

https.createServer(app).listen(g_port);

