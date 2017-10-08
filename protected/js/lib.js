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

function getParameterByName(name)
{
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function ddmmyyToUnix (date)
{
	var sp = date.trim().split("/");
	
	var year = sp[2];
	var month = pad(sp[1], 2, 0);
	var day = pad(sp[0], 2, 0);
	
	return year + month + day;	
}

var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function getMonthName (i)
{
	return meses[i-1];
}

function extractDateFromYYYYMMDDTHHMMSSstring (strDate)
{
	if (strDate == null) return "";
	//"2016-05-14T07:46:44.000Z"
	var s = strDate.replace("T", "-"); 
	var spl = s.split("-");
	return  spl[0] + "-" + spl[1] + "-" + spl[2];
}

function extractMonthFromYYYYMMDDstring (strDate)
{
	if (strDate == null) return "";
	//"2016-05-14T07:46:44.000Z"
	return  parseInt(strDate.split("-")[1]); 
}

function extractDateFromYYYYMMDDHHMMSSstring (strDate)
{
	if (strDate == null) return "";
	//"2016-05-14T07:46:44.000Z"
	return  dateToddmmyy (new Date(strDate));
}

function extractDayFromYYYYMMDDstring (strDate)
{
	if (strDate == null) return "";
	//"2016-05-14T07:46:44.000Z"
	return  parseInt(strDate.replace('T',' ').split("-")[2]); 
}

function dateToddmmyy(date)
{
    var dd = date.getDate();
    var mm = date.getMonth()+1; 

    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    return dd+'/'+mm+'/'+yyyy;
}

function dateToUnix(date)
{
    var dd = date.getDate();
    var mm = date.getMonth()+1; 

    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    return yyyy+mm+dd;
}

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

function getWeekNumber (date)
{
    var d = new Date(date);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function firstDayOfMonth()
{
	var date = new Date();
    var dd = "01";
    var mm = date.getMonth()+1; 

    var yyyy = date.getFullYear();
    
    if(mm<10)
	{
        mm='0'+mm
    } 
    return dd+'/'+mm+'/'+yyyy;
}

function secondsToString(seconds)
{
	var numyears = Math.floor(seconds / 31536000);
	var numdays = Math.floor((seconds % 31536000) / 86400); 
	var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
	var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
	var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
	//return numyears + " years " +  numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
	
	var ret = "";
	
	if (numdays != 0)
	{
		if (numdays == 1)
		{
			ret += numdays + "día ";
		}
		else
		{
			ret += numdays + "días ";
		}
	}
	if (numhours != 0)
	{
		ret += numhours + "h ";
	}
	if (numminutes != 0)
	{
		ret += numminutes + "min";
	}
	
	return ret;
}

function bool2Text (b)
{
	return b?"Sí":"No";
}

function nivel2Text (n)
{
	switch (n)
	{
		default: return "Desconocido";
		case 1: return "Recepcionista";
		case 5: return "Director";
		case 10: return "Administrador";
	}
}

function tipo2Text (i)
{
	if (i == 1) return "Premail";
	if (i == 2) return "Inmail";
	return "Indefinido";
}

/******************************************************************************************************************/

function loginToMaoni (user, pwd, callback)
{
    var params = { f: "login", user: user, pwd: pwd };

	$.post( "BBDD", JSON.stringify(params))
	.fail(function(data) 
    {
		alert(JSON.stringify(data));
		if (data.length > 0)
        {
            setCookie("SESSIONKEY", data[0].SESSIONKEY);
            callback();
        }
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
    //https://wsreservas.go.maoni.solutions/Usuarios/maoni/99390cfd08236787dbe95558846798013dcd060a1d6e6b49ad10a08f30eaf201
    
    if(user == "") user = "any";
    
    var url = "https://wsreservas.go.maoni.solutions/Usuarios/" + user + "/"+ pwd;
	$.get(url)
	.fail(function() 
    {
         callback("error login", null);
	})
	.done(function( data )
	{
        if (data != undefined && data.length > 0 && data[0].SESSIONKEY != 0)
        {
			setCookie("IDEMPRESA", data[0].IDEMPRESA);
			setCookie("DESCEMPRESA", data[0].DESCEMPRESA);
			
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
    //https://wsreservas.go.maoni.solutions/Hoteles/maoni
    var url = "https://wsreservas.go.maoni.solutions/Hoteles/" + getCookie("IDUSUARIO");
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

function getOrigen (callback)
{
    var url = "https://wsreservas.go.maoni.solutions/Origen";
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

function getReservas (idhotel, entrada, callback)
{
	//https://wsreservas.go.maoni.solutions/Reservas/1/20160501
	//app.get('/Reservas/:IDHOTEL/:ENTRADA', bbdd.getReservas, function(err,data){});

    var url = "https://wsreservas.go.maoni.solutions/Reservas/" + idhotel + "/" + entrada;
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

function getParametrosMailing (idhotel, callback)
{
	//https://wsreservas.go.maoni.solutions/ParametrosMailing/1

    var url = "https://wsreservas.go.maoni.solutions/ParametrosMailing/" + idhotel;
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

function getUsuarios (idhotel, callback)
{
	//https://wsreservas.go.maoni.solutions/UsuariosByHotel/1

    var url = "https://wsreservas.go.maoni.solutions/UsuariosByHotel/" + idhotel;
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

function getIncidenciasNoNotificadas (callback)
{
	//https://wsreservas.go.maoni.solutions/IncidenciasNoNotificadas

    var url = "https://wsreservas.go.maoni.solutions/IncidenciasNoNotificadas";
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

function getEncuestasResumen (idhotel, entrada, callback)
{
	//https://wsreservas.go.maoni.solutions/EncuestasResumen/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/EncuestasResumen/" + idhotel + "/" + entrada;
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

function getEncuestasResumenRango (idhotel, desde, hasta, callback)
{
	//https://wsreservas.go.maoni.solutions/EncuestasResumenRango/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/EncuestasResumenRango/" + idhotel + "/" + desde + "/" + hasta;
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

function getEncuestasResumenRangoSinAcumular (idhotel, desde, hasta, callback)
{
	//https://wsreservas.go.maoni.solutions/getEncuestasResumenRangoSinAcumular/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/getEncuestasResumenRangoSinAcumular/" + idhotel + "/" + desde + "/" + hasta;
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

function getIndicesSatisfaccion (idhotel, desde, hasta, callback)
{
	//https://wsreservas.go.maoni.solutions/IndicesSatisfaccion/1/20160501/20160531

    var url = "https://wsreservas.go.maoni.solutions/IndicesSatisfaccion/" + idhotel + "/" + desde + "/" + hasta;
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

function getIndicesSatisfaccionSemana (idhotel, pyear,wdesde, whasta, callback)
{
	//https://wsreservas.go.maoni.solutions/IndicesSatisfaccionSemana/1/10/20

    var url = "https://wsreservas.go.maoni.solutions/IndicesSatisfaccionSemana/" + idhotel + "/" + pyear + "/" + wdesde + "/" + whasta;
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

function getTopResolutivos (idempresa, anyo, callback)
{
	https://wsreservas.go.maoni.solutions/topResolutivos/1/2016

    var url = "https://wsreservas.go.maoni.solutions/topResolutivos/" + idempresa + "/" + anyo;
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

function getIncidencia (rowid, callback)
{
	//https://wsreservas.go.maoni.solutions/EncuestasResumen/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/incidencia/" + rowid;
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

function getIncidenciasLast5 (idhotel, callback)
{
	//https://wsreservas.go.maoni.solutions/EncuestasResumen/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/incidenciasLast5/" + idhotel;
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

function getIncidenciasRango (idhotel, desde, hasta, callback)
{
	//https://wsreservas.go.maoni.solutions/EncuestasResumen/1/20160514

    var url = "https://wsreservas.go.maoni.solutions/IncidenciasRango/" + idhotel + "/" + desde + "/" + hasta;
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

function getIncidenciasPorSemana (idhotel, desde, hasta, callback)
{
	//https://wsreservas.go.maoni.solutions/IncidenciasPorSemana/1/10/20

    var url = "https://wsreservas.go.maoni.solutions/IncidenciasPorSemana/" + idhotel + "/" + desde + "/" + hasta;
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

function reservaResetPre(idhotel, idreserva, callback)
{
	var url = "https://wsreservas.go.maoni.solutions/ReservaResetPre/" + idhotel + "/" + idreserva;
	
	try{
	$.ajax({
		url: url,
		method: "PUT",
		data: "{}",
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function reservaResetIn(idhotel, idreserva, callback)
{
	var url = "https://wsreservas.go.maoni.solutions/ReservaResetIn/" + idhotel + "/" + idreserva;
	
	try{
	$.ajax({
		url: url,
		method: "PUT",
		data: "{}",
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function reservaSetIdioma(idhotel, idreserva, idioma, callback)
{
	var url = "https://wsreservas.go.maoni.solutions/ReservaSetIdioma/" + idhotel + "/" + idreserva + "/" + idioma;
	
	try{
	$.ajax({
		url: url,
		method: "PUT",
		data: "{}",
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function reservaSetPais(idhotel, idreserva, pais, callback)
{
	var url = "https://wsreservas.go.maoni.solutions/ReservaSetPais/" + idhotel + "/" + idreserva + "/" + pais;
	
	try{
	$.ajax({
		url: url,
		method: "PUT",
		data: "{}",
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function deleteReserva (rowid, callback)
{
	deleteData("https://wsreservas.go.maoni.solutions/Reservas/" + rowid, {}, callback);
}

function updateReserva (rowid, data, callback)
{
	putData("https://wsreservas.go.maoni.solutions/Reservas/" + rowid, data, callback);
}

function logout()
{
    setCookie("SESSIONKEY", 0);
    setCookie("DESCUSUARIO", 0);
    
    window.location.href = "index.html";
}

function navigateTo (url, suffix)
{
	if (typeof suffix == 'undefined')
	{
		return url + "?SESSIONKEY=" + getCookie("SESSIONKEY");
	}
	else
	{
		return url + "?SESSIONKEY=" + getCookie("SESSIONKEY") + "&" + suffix;
	}
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

function postData(url, data, callback)
{
	try{
	$.ajax({
		url: url,
		method: "POST",
		data: JSON.stringify(data),
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function putData(url, data, callback)
{
	try{
	$.ajax({
		url: url,
		method: "PUT",
		data: JSON.stringify(data),
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function deleteData(url, data, callback)
{
	try{
	$.ajax({
		url: url,
		method: "DELETE",
		data: JSON.stringify(data),
		dataType: 'json',
		contentType: "application/json",
		success: function(result,status,jqXHR )
		{
			callback (null, result);
		},
		error(jqXHR, textStatus, errorThrown)
		{
			callback (errorThrown, null);
		}
    }); 
	}
	catch (err)
	{
		alert(err);
	}
}

function getPaises (callback)
{
	//https://wsreservas.go.maoni.solutions/Paises

    var url = "https://wsreservas.go.maoni.solutions/Paises";
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

function getIdiomas (callback)
{
	//https://wsreservas.go.maoni.solutions/Idiomas

    var url = "https://wsreservas.go.maoni.solutions/Idiomas";
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

function fillComboCountry(selector)
{
	$(selector).empty();
	
	getPaises(function(err, data)
	{
		if (data)
		{
			for (var i = 0; i < data.length; i++)
			{
				//$(selector).append('<option value="AF">Afghanistan</option>');
				$(selector).append('<option value="' + data[i].KEY + '">' + data[i].PAIS + '</option>');
			}
		}
	});
}

function fillComboIdioma(selector)
{
	$(selector).empty();
	
	getIdiomas(function(err, data)
	{
		if (data)
		{
			for (var i = 0; i < data.length; i++)
			{
				$(selector).append('<option value="' + data[i].KEY + '">' + data[i].IDIOMA + '</option>');
			}
		}
	});
}