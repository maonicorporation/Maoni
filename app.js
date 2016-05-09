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
        
        if (path.extname(filename).toUpperCase() == ".HTML")
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
    host: 'shx16.guebs.net',//mail.go.maoni.solutions
    //port: 465 ,//587 465, 25
    //secure: false,
    auth: {
        user: 'survei@go.maoni.solutions',
        pass: '+A?51#[#Q5-W76'
    }
};
  
var transporter = nodemailer.createTransport(smtpConfig);

transporter.verify(function(error, success) {
   if (error) {
        utilities.logFile(error);
        //sendemail();
   } else {
        utilities.logFile('Server is ready to take our messages');
        sendemail();
   }
});

function sendemail ()
{
    var mailOptions = 
    {
        from:       'survei@go.maoni.solutions',
        to:         'emilio@onacorporation.com,rafael.dejorge@onacorporation.com,xavier.camprubi@onacorporattion.com',
        subject:    'Maoni primer email',
        text:       'Hello world',
        html:       '<b>Hello world</b>'
    };
    
    transporter.sendMail(mailOptions, function(error, info)
    {
        if(error)
        {
            return console.log(error);
        }
        utilities.logFile('Message sent: ' + info.response);
    });
}
//sendemail ();
//FIN NODEMAILER

function enviarMails()
{
    //Bucle de empresas
    bbdd.sel_all_from_empresas (function (err, data1)
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
                                    bbdd.sel_all_from_reservas (data3[k].IDHOTEL, data3[k].DIAS, data3[k].IDIOMA, function (err, data4)
                                    {
                                        for (var l = 0; l <data4.length; l++)
                                        {
                                            utilities.logFile("      " + data4[l].IDRESERVA + " " + data4[l].ENTRADA);
                                        }
                                    });
                                }
                            }
                        }                        
                    });
                }
            });
        }
    });
    
    setTimeout (enviarMails, 1000 * 60 * 10); // 10 minutos
}

//enviarMails();

//https://localhost:4000
var mess = "INICIO maoni. Escuchando en el puerto: " + g_port;

utilities.logFile(mess);

//https.createServer(options, app).listen(g_port);
https.createServer(app).listen(g_port);

