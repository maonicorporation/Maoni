/******************************************************************************************************************/

var COOKIETIMEOUT = 90;

function setCookie(cname, cvalue)
{
    var d = new Date();
    d.setTime(d.getTime() + (COOKIETIMEOUT * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

/******************************************************************************************************************/

function loginToMaoni (user, pwd, callback)
{
    var params = { f: "login", user: user, pwd: pwd };

	$.post( "BBDD", JSON.stringify(params))
	.fail(function() 
    {
	})
	.done(function( data )
	{
        if (data.length > 0)
        {
            setCookie("SESSIONKEY", data[0].SESSIONKEY);
            callback();
        }
	});
}

function login (user, pwd, callback)
{
    //http://wsreservas.go.maoni.solutions/Usuarios/maoni/99390cfd08236787dbe95558846798013dcd060a1d6e6b49ad10a08f30eaf201
    
    if(user == "") user = "any";
    
    var url = "http://wsreservas.go.maoni.solutions/Usuarios/" + user + "/"+ pwd;
	$.get(url)
	.fail(function() 
    {
         callback("error login", null);
	})
	.done(function( data )
	{
        if (data != undefined && data.length > 0)
        {
            loginToMaoni(user,pwd,function()
            {
                setCookie("SESSIONKEYBBDD", data[0].SESSIONKEY);
                setCookie("IDUSUARIO", user);
                setCookie("DESCUSUARIO", data[0].DESCUSUARIO);
                callback(null, data);
            });

        }
        else
        {
            callback(null, null);
        }        
	});
}

function getHoteles (callback)
{
    //http://wsreservas.go.maoni.solutions/Hoteles/maoni
    var url = "http://wsreservas.go.maoni.solutions/Hoteles/" + getCookie("IDUSUARIO");
	$.get(url)
	.fail(function() 
    {
         callback("error", null);
	})
	.done(function( data )
	{
        callback(null, data);
	});
}

function logout()
{
    setCookie("SESSIONKEY", 0);
    setCookie("DESCUSUARIO", 0);
    
    window.location.href = "index.html";
}

function navigateTo (url)
{
    return url + "?SESSIONKEY=" + getCookie("SESSIONKEY");
}

/******************************************************************************************************************/

function editButton (id)
{
    var onclickevent = 'onclick="edit(' + id + ')"';
    return '<td><span style="cursor: pointer;" ' + onclickevent + ' ><span  href="#" class="glyphicon glyphicon-pencil" aria-hidden="true"></span></span></td>';
}   

function pad(n, width, z)
{
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}