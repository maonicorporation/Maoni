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

/******************************************************************************************************************/

function editButton (id)
{
    var onclickevent = 'onclick="edit(' + id + ')"';
    return '<td><span style="cursor: pointer;" ' + onclickevent + ' ><span  href="#" class="glyphicon glyphicon-pencil" aria-hidden="true"></span></span></td>';
}   