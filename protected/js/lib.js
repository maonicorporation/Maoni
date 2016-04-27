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

function selAllUsers (callback)
{
	var params = { f : "sel_all_from_users" };

	$.post( "BBDD", JSON.stringify(params))
	.fail(function() 
    {
         alert ('fail');
	})
	.done(function( data )
	{
        callback(jQuery.parseJSON(data));
	});
}

function login (user, pwd, callback)
{
    var params = { f: "login", user: user, pwd: pwd };

	$.post( "BBDD", JSON.stringify(params))
	.fail(function() 
    {
         callback("error login", jQuery.parseJSON("{err:0}"));
	})
	.done(function( data )
	{
        if (data.length > 0)
        {
            setCookie("SESSIONKEY", data[0].SESSIONKEY);
            setCookie("DESCUSUARIO", data[0].DESCUSUARIO);
        }
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