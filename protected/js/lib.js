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

function ddmmyyToUnix (date)
{
	var sp = date.split("/");
	
	var year = sp[2];
	var month = pad(sp[1], 2, 0);
	var day = pad(sp[0], 2, 0);
	
	return year + month + day;	
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
        if (data != undefined && data.length > 0 && data[0].SESSIONKEY != 0)
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

function getReservas (idhotel, entrada, callback)
{
	//http://wsreservas.go.maoni.solutions/Reservas/1/20160501
	//app.get('/Reservas/:IDHOTEL/:ENTRADA', bbdd.getReservas, function(err,data){});

    var url = "http://wsreservas.go.maoni.solutions/Reservas/" + idhotel + "/" + entrada;
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

function postData(url, data, callback)
{
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

function fillComboCountry(selector)
{
    $(selector).empty();
    $(selector).append('<option value="AF">Afghanistan</option>');
	$(selector).append('<option value="AX">Åland Islands</option>');
	$(selector).append('<option value="AL">Albania</option>');
	$(selector).append('<option value="DZ">Algeria</option>');
	$(selector).append('<option value="AS">American Samoa</option>');
	$(selector).append('<option value="AD">Andorra</option>');
	$(selector).append('<option value="AO">Angola</option>');
	$(selector).append('<option value="AI">Anguilla</option>');
	$(selector).append('<option value="AQ">Antarctica</option>');
	$(selector).append('<option value="AG">Antigua and Barbuda</option>');
	$(selector).append('<option value="AR">Argentina</option>');
	$(selector).append('<option value="AM">Armenia</option>');
	$(selector).append('<option value="AW">Aruba</option>');
	$(selector).append('<option value="AU">Australia</option>');
	$(selector).append('<option value="AT">Austria</option>');
	$(selector).append('<option value="AZ">Azerbaijan</option>');
	$(selector).append('<option value="BS">Bahamas</option>');
	$(selector).append('<option value="BH">Bahrain</option>');
	$(selector).append('<option value="BD">Bangladesh</option>');
	$(selector).append('<option value="BB">Barbados</option>');
	$(selector).append('<option value="BY">Belarus</option>');
	$(selector).append('<option value="BE">Belgium</option>');
	$(selector).append('<option value="BZ">Belize</option>');
	$(selector).append('<option value="BJ">Benin</option>');
	$(selector).append('<option value="BM">Bermuda</option>');
	$(selector).append('<option value="BT">Bhutan</option>');
	$(selector).append('<option value="BO">Bolivia, Plurinational State of</option>');
	$(selector).append('<option value="BQ">Bonaire, Sint Eustatius and Saba</option>');
	$(selector).append('<option value="BA">Bosnia and Herzegovina</option>');
	$(selector).append('<option value="BW">Botswana</option>');
	$(selector).append('<option value="BV">Bouvet Island</option>');
	$(selector).append('<option value="BR">Brazil</option>');
	$(selector).append('<option value="IO">British Indian Ocean Territory</option>');
	$(selector).append('<option value="BN">Brunei Darussalam</option>');
	$(selector).append('<option value="BG">Bulgaria</option>');
	$(selector).append('<option value="BF">Burkina Faso</option>');
	$(selector).append('<option value="BI">Burundi</option>');
	$(selector).append('<option value="KH">Cambodia</option>');
	$(selector).append('<option value="CM">Cameroon</option>');
	$(selector).append('<option value="CA">Canada</option>');
	$(selector).append('<option value="CV">Cape Verde</option>');
	$(selector).append('<option value="KY">Cayman Islands</option>');
	$(selector).append('<option value="CF">Central African Republic</option>');
	$(selector).append('<option value="TD">Chad</option>');
	$(selector).append('<option value="CL">Chile</option>');
	$(selector).append('<option value="CN">China</option>');
	$(selector).append('<option value="CX">Christmas Island</option>');
	$(selector).append('<option value="CC">Cocos (Keeling) Islands</option>');
	$(selector).append('<option value="CO">Colombia</option>');
	$(selector).append('<option value="KM">Comoros</option>');
	$(selector).append('<option value="CG">Congo</option>');
	$(selector).append('<option value="CD">Congo, the Democratic Republic of the</option>');
	$(selector).append('<option value="CK">Cook Islands</option>');
	$(selector).append('<option value="CR">Costa Rica</option>');
	$(selector).append('<option value="CI">Côte d\'Ivoire</option>');
	$(selector).append('<option value="HR">Croatia</option>');
	$(selector).append('<option value="CU">Cuba</option>');
	$(selector).append('<option value="CW">Curaçao</option>');
	$(selector).append('<option value="CY">Cyprus</option>');
	$(selector).append('<option value="CZ">Czech Republic</option>');
	$(selector).append('<option value="DK">Denmark</option>');
	$(selector).append('<option value="DJ">Djibouti</option>');
	$(selector).append('<option value="DM">Dominica</option>');
	$(selector).append('<option value="DO">Dominican Republic</option>');
	$(selector).append('<option value="EC">Ecuador</option>');
	$(selector).append('<option value="EG">Egypt</option>');
	$(selector).append('<option value="SV">El Salvador</option>');
	$(selector).append('<option value="GQ">Equatorial Guinea</option>');
	$(selector).append('<option value="ER">Eritrea</option>');
	$(selector).append('<option value="EE">Estonia</option>');
	$(selector).append('<option value="ET">Ethiopia</option>');
	$(selector).append('<option value="FK">Falkland Islands (Malvinas)</option>');
	$(selector).append('<option value="FO">Faroe Islands</option>');
	$(selector).append('<option value="FJ">Fiji</option>');
	$(selector).append('<option value="FI">Finland</option>');
	$(selector).append('<option value="FR">France</option>');
	$(selector).append('<option value="GF">French Guiana</option>');
	$(selector).append('<option value="PF">French Polynesia</option>');
	$(selector).append('<option value="TF">French Southern Territories</option>');
	$(selector).append('<option value="GA">Gabon</option>');
	$(selector).append('<option value="GM">Gambia</option>');
	$(selector).append('<option value="GE">Georgia</option>');
	$(selector).append('<option value="DE">Germany</option>');
	$(selector).append('<option value="GH">Ghana</option>');
	$(selector).append('<option value="GI">Gibraltar</option>');
	$(selector).append('<option value="GR">Greece</option>');
	$(selector).append('<option value="GL">Greenland</option>');
	$(selector).append('<option value="GD">Grenada</option>');
	$(selector).append('<option value="GP">Guadeloupe</option>');
	$(selector).append('<option value="GU">Guam</option>');
	$(selector).append('<option value="GT">Guatemala</option>');
	$(selector).append('<option value="GG">Guernsey</option>');
	$(selector).append('<option value="GN">Guinea</option>');
	$(selector).append('<option value="GW">Guinea-Bissau</option>');
	$(selector).append('<option value="GY">Guyana</option>');
	$(selector).append('<option value="HT">Haiti</option>');
	$(selector).append('<option value="HM">Heard Island and McDonald Islands</option>');
	$(selector).append('<option value="VA">Holy See (Vatican City State)</option>');
	$(selector).append('<option value="HN">Honduras</option>');
	$(selector).append('<option value="HK">Hong Kong</option>');
	$(selector).append('<option value="HU">Hungary</option>');
	$(selector).append('<option value="IS">Iceland</option>');
	$(selector).append('<option value="IN">India</option>');
	$(selector).append('<option value="ID">Indonesia</option>');
	$(selector).append('<option value="IR">Iran, Islamic Republic of</option>');
	$(selector).append('<option value="IQ">Iraq</option>');
	$(selector).append('<option value="IE">Ireland</option>');
	$(selector).append('<option value="IM">Isle of Man</option>');
	$(selector).append('<option value="IL">Israel</option>');
	$(selector).append('<option value="IT">Italy</option>');
	$(selector).append('<option value="JM">Jamaica</option>');
	$(selector).append('<option value="JP">Japan</option>');
	$(selector).append('<option value="JE">Jersey</option>');
	$(selector).append('<option value="JO">Jordan</option>');
	$(selector).append('<option value="KZ">Kazakhstan</option>');
	$(selector).append('<option value="KE">Kenya</option>');
	$(selector).append('<option value="KI">Kiribati</option>');
	$(selector).append('<option value="KP">Korea, Democratic People\'s Republic of</option>');
	$(selector).append('<option value="KR">Korea, Republic of</option>');
	$(selector).append('<option value="KW">Kuwait</option>');
	$(selector).append('<option value="KG">Kyrgyzstan</option>');
	$(selector).append('<option value="LA">Lao People\'s Democratic Republic</option>');
	$(selector).append('<option value="LV">Latvia</option>');
	$(selector).append('<option value="LB">Lebanon</option>');
	$(selector).append('<option value="LS">Lesotho</option>');
	$(selector).append('<option value="LR">Liberia</option>');
	$(selector).append('<option value="LY">Libya</option>');
	$(selector).append('<option value="LI">Liechtenstein</option>');
	$(selector).append('<option value="LT">Lithuania</option>');
	$(selector).append('<option value="LU">Luxembourg</option>');
	$(selector).append('<option value="MO">Macao</option>');
	$(selector).append('<option value="MK">Macedonia, the former Yugoslav Republic of</option>');
	$(selector).append('<option value="MG">Madagascar</option>');
	$(selector).append('<option value="MW">Malawi</option>');
	$(selector).append('<option value="MY">Malaysia</option>');
	$(selector).append('<option value="MV">Maldives</option>');
	$(selector).append('<option value="ML">Mali</option>');
	$(selector).append('<option value="MT">Malta</option>');
	$(selector).append('<option value="MH">Marshall Islands</option>');
	$(selector).append('<option value="MQ">Martinique</option>');
	$(selector).append('<option value="MR">Mauritania</option>');
	$(selector).append('<option value="MU">Mauritius</option>');
	$(selector).append('<option value="YT">Mayotte</option>');
	$(selector).append('<option value="MX">Mexico</option>');
	$(selector).append('<option value="FM">Micronesia, Federated States of</option>');
	$(selector).append('<option value="MD">Moldova, Republic of</option>');
	$(selector).append('<option value="MC">Monaco</option>');
	$(selector).append('<option value="MN">Mongolia</option>');
	$(selector).append('<option value="ME">Montenegro</option>');
	$(selector).append('<option value="MS">Montserrat</option>');
	$(selector).append('<option value="MA">Morocco</option>');
	$(selector).append('<option value="MZ">Mozambique</option>');
	$(selector).append('<option value="MM">Myanmar</option>');
	$(selector).append('<option value="NA">Namibia</option>');
	$(selector).append('<option value="NR">Nauru</option>');
	$(selector).append('<option value="NP">Nepal</option>');
	$(selector).append('<option value="NL">Netherlands</option>');
	$(selector).append('<option value="NC">New Caledonia</option>');
	$(selector).append('<option value="NZ">New Zealand</option>');
	$(selector).append('<option value="NI">Nicaragua</option>');
	$(selector).append('<option value="NE">Niger</option>');
	$(selector).append('<option value="NG">Nigeria</option>');
	$(selector).append('<option value="NU">Niue</option>');
	$(selector).append('<option value="NF">Norfolk Island</option>');
	$(selector).append('<option value="MP">Northern Mariana Islands</option>');
	$(selector).append('<option value="NO">Norway</option>');
	$(selector).append('<option value="OM">Oman</option>');
	$(selector).append('<option value="PK">Pakistan</option>');
	$(selector).append('<option value="PW">Palau</option>');
	$(selector).append('<option value="PS">Palestinian Territory, Occupied</option>');
	$(selector).append('<option value="PA">Panama</option>');
	$(selector).append('<option value="PG">Papua New Guinea</option>');
	$(selector).append('<option value="PY">Paraguay</option>');
	$(selector).append('<option value="PE">Peru</option>');
	$(selector).append('<option value="PH">Philippines</option>');
	$(selector).append('<option value="PN">Pitcairn</option>');
	$(selector).append('<option value="PL">Poland</option>');
	$(selector).append('<option value="PT">Portugal</option>');
	$(selector).append('<option value="PR">Puerto Rico</option>');
	$(selector).append('<option value="QA">Qatar</option>');
	$(selector).append('<option value="RE">Réunion</option>');
	$(selector).append('<option value="RO">Romania</option>');
	$(selector).append('<option value="RU">Russian Federation</option>');
	$(selector).append('<option value="RW">Rwanda</option>');
	$(selector).append('<option value="BL">Saint Barthélemy</option>');
	$(selector).append('<option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>');
	$(selector).append('<option value="KN">Saint Kitts and Nevis</option>');
	$(selector).append('<option value="LC">Saint Lucia</option>');
	$(selector).append('<option value="MF">Saint Martin (French part)</option>');
	$(selector).append('<option value="PM">Saint Pierre and Miquelon</option>');
	$(selector).append('<option value="VC">Saint Vincent and the Grenadines</option>');
	$(selector).append('<option value="WS">Samoa</option>');
	$(selector).append('<option value="SM">San Marino</option>');
	$(selector).append('<option value="ST">Sao Tome and Principe</option>');
	$(selector).append('<option value="SA">Saudi Arabia</option>');
	$(selector).append('<option value="SN">Senegal</option>');
	$(selector).append('<option value="RS">Serbia</option>');
	$(selector).append('<option value="SC">Seychelles</option>');
	$(selector).append('<option value="SL">Sierra Leone</option>');
	$(selector).append('<option value="SG">Singapore</option>');
	$(selector).append('<option value="SX">Sint Maarten (Dutch part)</option>');
	$(selector).append('<option value="SK">Slovakia</option>');
	$(selector).append('<option value="SI">Slovenia</option>');
	$(selector).append('<option value="SB">Solomon Islands</option>');
	$(selector).append('<option value="SO">Somalia</option>');
	$(selector).append('<option value="ZA">South Africa</option>');
	$(selector).append('<option value="GS">South Georgia and the South Sandwich Islands</option>');
	$(selector).append('<option value="SS">South Sudan</option>');
	$(selector).append('<option value="ES">Spain</option>');
	$(selector).append('<option value="LK">Sri Lanka</option>');
	$(selector).append('<option value="SD">Sudan</option>');
	$(selector).append('<option value="SR">Suriname</option>');
	$(selector).append('<option value="SJ">Svalbard and Jan Mayen</option>');
	$(selector).append('<option value="SZ">Swaziland</option>');
	$(selector).append('<option value="SE">Sweden</option>');
	$(selector).append('<option value="CH">Switzerland</option>');
	$(selector).append('<option value="SY">Syrian Arab Republic</option>');
	$(selector).append('<option value="TW">Taiwan, Province of China</option>');
	$(selector).append('<option value="TJ">Tajikistan</option>');
	$(selector).append('<option value="TZ">Tanzania, United Republic of</option>');
	$(selector).append('<option value="TH">Thailand</option>');
	$(selector).append('<option value="TL">Timor-Leste</option>');
	$(selector).append('<option value="TG">Togo</option>');
	$(selector).append('<option value="TK">Tokelau</option>');
	$(selector).append('<option value="TO">Tonga</option>');
	$(selector).append('<option value="TT">Trinidad and Tobago</option>');
	$(selector).append('<option value="TN">Tunisia</option>');
	$(selector).append('<option value="TR">Turkey</option>');
	$(selector).append('<option value="TM">Turkmenistan</option>');
	$(selector).append('<option value="TC">Turks and Caicos Islands</option>');
	$(selector).append('<option value="TV">Tuvalu</option>');
	$(selector).append('<option value="UG">Uganda</option>');
	$(selector).append('<option value="UA">Ukraine</option>');
	$(selector).append('<option value="AE">United Arab Emirates</option>');
	$(selector).append('<option value="GB">United Kingdom</option>');
	$(selector).append('<option value="US">United States</option>');
	$(selector).append('<option value="UM">United States Minor Outlying Islands</option>');
	$(selector).append('<option value="UY">Uruguay</option>');
	$(selector).append('<option value="UZ">Uzbekistan</option>');
	$(selector).append('<option value="VU">Vanuatu</option>');
	$(selector).append('<option value="VE">Venezuela, Bolivarian Republic of</option>');
	$(selector).append('<option value="VN">Viet Nam</option>');
	$(selector).append('<option value="VG">Virgin Islands, British</option>');
	$(selector).append('<option value="VI">Virgin Islands, U.S.</option>');
	$(selector).append('<option value="WF">Wallis and Futuna</option>');
	$(selector).append('<option value="EH">Western Sahara</option>');
	$(selector).append('<option value="YE">Yemen</option>');
	$(selector).append('<option value="ZM">Zambia</option>');
	$(selector).append('<option value="ZW">Zimbabwe</option>');
}