/*

http://stackoverflow.com/questions/1595611/how-to-properly-create-a-custom-object-in-javascript

PATTERN

Problem here is that every object gets its own copy of all private and public functions -> no es problema... -> la alternativa es usar lo de "prototype"

var Foo = function ()
{
    var privateStaticMethod = function () { };
    var privateStaticVariable = "foo";

    var constructor = function Foo(foo, bar)
    {
        var privateMethod = function () { };
        this.publicMethod = function () { };
    };

    constructor.publicStaticMethod = function () { };

    return constructor;
} ();
*/

var DEIForm = function ()
{
    var _config = {};
    var _data = null;
    var _saveCallback = null;
    var _cancelCallback = null;
    var _deleteCallback = null;
    var _deleteWantsConfirmation = false;
    var _saveteWantsConfirmation = false;

    this.clickbuttonSearch = function (id)
    {
        var formList = new DEIList("formSelectionList", "Seleccione...");

        formList.setJsonData(_config.fields[id].data);

        formList.setCancelButton(true, function () 
        {
            
        });

        formList.setSaveButton(function (key, val)
        {
            formList.hideDialog();

            var idField = "#" + _config.fields[id].idField;
            $(idField).val(key);

            var asociado = "#" + _config.fields[id].textField;
            $(asociado).val(val);
        });

        formList.showDialog();
    }

    this.clickbuttonSearchTree = function (id)
    {
        var formTree = new DEITree("formSelectionTree", "Seleccione...");

        formTree.setJsonData(_config.fields[id].data);

        formTree.setCancelButton(true, function ()
        {

        });

        formTree.setSaveButton(function (key, val)
        {
            formTree.hideDialog();

            var idField = "#" + _config.fields[id].idField;
            $(idField).val(key);

            var asociado = "#" + _config.fields[id].textField;
            $(asociado).val(val);
        });

        formTree.showDialog();
    }

    var constructor = function DEIForm (uniqueId, tittle)
    {
        _config.uniqueId = uniqueId;
        _config.tittle = tittle;
        _config.cancelButton = false;
        _config.deleteButton = false;
        _config.saveButton = false;
        _config.fields = [];

        this.setCancelButton = function (b, callback)
        {
            _config.cancelButton = b;
            _cancelCallback = callback;
            return this;
        };

        this.setDeleteButton = function (b, deleteWantsConfirmation, callback)
        {
            _config.deleteButton = b;
            _deleteWantsConfirmation = deleteWantsConfirmation;
            _deleteCallback = callback;
            return this;
        };

        this.setSaveButton = function (b, saveWantsConfirmation, callback)
        {
            _config.saveButton = b;
            _saveWantsConfirmation = saveWantsConfirmation;
            _saveCallback = callback;
            return this;
        };

        this.addField = function (idField, text, type, enabled, width, textLength)
        {
            _config.fields.push({ idField: idField, text: text, type: type, enabled: enabled, width: width, textLength: textLength });
            return this;
        };

        this.addButton = function (idField, textField, text, enabled, data, width)
        {
            _config.fields.push({ idField: idField, textField: textField, text: text, type: "button", enabled: enabled, width: width, data: data });
            return this;
        };
        //form.addButton("IDATENDIDOPOR1", true, jsonDataUsuarios);

        this.addTree = function (idField, textField, text, enabled, data, width)
        {
            _config.fields.push({ idField: idField, textField: textField, text: text, type: "tree", enabled: enabled, width: width, data: data });
            return this;
        };

        this.setJsonData = function (data)
        {
            _data = data;
            return this;
        };

        this.setTittle = function (str)
        {
            _config.tittle = str;
            return this;
        };

        this.hideDialog = function ()
        {
            $('#' + _config.uniqueId).modal('hide');
        };

        this.showDialog = function ()
        {
            $('#' + _config.uniqueId).remove();
            var embed = '';

            embed += '<div class="modal fade" id="' + _config.uniqueId + '" tabindex="-1" role="dialog" aria-labelledby="' + _config.uniqueId + '">';
            embed += '<div class="modal-dialog _modal-dialog-fullscreen modal-lg" role="document">';
            embed += '<div class="modal-content _modal-content-fullscreen">';
            embed += '<div class="modal-header">';
            embed += '<button type="button" class="close" data-dismiss="modal" aria-label="Cancelar"><span aria-hidden="true">&times; </span></button>';
            embed += '<h4 class="modal-title" id="' + _config.uniqueId + '">' + _config.tittle + '</h4>';
            embed += '</div>';
            embed += '<div class="modal-body">';

            //Formulario
            embed += '<br/><form role="form">';
            embed += '<div class="row">';

            for (var i = 0; i < _config.fields.length; i++)
            {                
                embed += '<div class="col-md-' + _config.fields[i].width + '">';

                var enabled = _config.fields[i].enabled ? '' : ' disabled ';
                var enabled2 = _config.fields[i].enabled ? '' : ' disabled="" ';

                if (_config.fields[i].type == 'break')
                {
                   
                }
                else if (_config.fields[i].type == 'bool')
                {
                    embed += '<br/><div class="form-group fg-line _checkbox">';
                    embed += '<label for="' + _config.fields[i].idField + '">' + _config.fields[i].text + '</label>';                    
                    embed += '<input campo-chk ' + enabled + ' value="" ' + (_data[_config.fields[i].idField] ? 'checked':'') + ' type="checkbox" id="' + _config.fields[i].idField + '" ' + enabled2 + '>';
                    embed += '<i class="input-helper"></i>';
                    embed += '</div>';
                }
                else if (_config.fields[i].type == 'button')
                {
                    embed += '<div class="form-group fg-line ' + enabled + '">';
                    embed += '<br/><button type="button" class="btn btn-primary" style="margin-top: 4px;" onclick="clickbuttonSearch(' + i + ');">' + _config.fields[i].text + '<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span></button>';

                    embed += '<input campo class="form-control input-md" value="' + _data[_config.fields[i].idField] + '" id="' + _config.fields[i].idField + '" placeholder=" " type="hidden" >';

                    embed += '</div>';
                }
                else if (_config.fields[i].type == 'tree')
                {
                    embed += '<div class="form-group fg-line ' + enabled + '">';
                    embed += '<br/><button type="button" class="btn btn-primary" onclick="clickbuttonSearchTree(' + i + ');">' + _config.fields[i].text + '<span class="glyphicon glyphicon-list" aria-hidden="true"></span></button>';

                    embed += '<input campo class="form-control input-md" value="' + _data[_config.fields[i].idField] + '" id="' + _config.fields[i].idField + '" placeholder=" " type="hidden" >';

                    embed += '</div>';
                }
                else 
                {   
                    embed += '<div class="form-group fg-line ' + enabled + '">';
                    embed += '<label for="' + _config.fields[i].idField + '">' + _config.fields[i].text + '</label>';

                    var maxlength = '';

                    if (typeof (_config.fields[i].textLength) !== 'undefined')
                    {
                        maxlength = ' maxlength="' + _config.fields[i].textLength + '"';
                    }

                    if (_config.fields[i].type == 'textarea')
                    {
                        embed += '<textarea campo rows="1" data-autoresize class="form-control input-md" id="' + _config.fields[i].idField + '" placeholder=" " type="text" ' + enabled2 + maxlength + '>' + _data[_config.fields[i].idField] + '</textarea>';
                    }
                    else if (_config.fields[i].type == 'date')
                    {
                        embed += '<input campo class="deidate form-control input-md" value="' + _data[_config.fields[i].idField].substring(0, 10) + '" id="' + _config.fields[i].idField + '" type="' + _config.fields[i].type + '" ' + enabled2 + maxlength + '>';
                    }
                    else if (_config.fields[i].type == 'number')
                    {
                        embed += '<input campo class="form-control input-md" style="text-align: right;" value="' + _data[_config.fields[i].idField] + '" id="' + _config.fields[i].idField + '" placeholder=" " type="text" ' + enabled2 + maxlength + '>';
                    }
                    else
                    {
                        embed += '<input campo class="form-control input-md" value="' + _data[_config.fields[i].idField] + '" id="' + _config.fields[i].idField + '" placeholder=" " type="' + _config.fields[i].type + '" ' + enabled2 + maxlength + '>';
                    }
                    
                    embed += '</div>';
                }

                embed += '</div>';
            }
            embed += '</div>';

            embed += '</div>';
            embed += '<div class="modal-footer">';

            if (_config.deleteButton)
            {
                embed += '<button delete-click-button type="button" class="pull-left btn bgm-red waves-effect">Eliminar <i class="md md-delete"></i></button>';
            }

            if (_config.saveButton)
            {
                embed += '<button save-click-button type="button" class="pull-left btn bgm-lightgreen waves-effect">Guardar <i class="md md-done"></i></button>';
            }

            if (_config.cancelButton)
            {
                embed += '<button cancel-click-button type="button" class="btn bgm-indigo waves-effect" data-dismiss="modal">Cerrar <i class="md md-clear"></i></button>';
            }
                
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';

            $('body').append(embed);
            $('#' + _config.uniqueId).modal('show');

            jQuery(function ($)
            {
                $(".deidate").mask("9999-99-99", { placeholder: "yyyy-mm-dd" });
            });

            $('#' + _config.uniqueId).on('shown.bs.modal', function (e)
            {
                jQuery.each(jQuery('textarea[data-autoresize]'), function (idx, val)
                {
                    var offset = this.offsetHeight - this.clientHeight;

                    jQuery('#' + val.id).css('height', 'auto').css('height', this.scrollHeight + offset);

                    var resizeTextarea = function (el)
                    {
                        jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
                    };
                    jQuery(this).on('keyup input', function () { resizeTextarea(this); }).removeAttr('data-autoresize');
                });
            })

            jQuery.each(jQuery('button[save-click-button]'), function (idx, val)
            {
                jQuery(this).on('click', function ()
                {
                    if (_saveWantsConfirmation)
                    {
                        swal({
                            title: "¿Está seguro?",
                            text: "Se va a guardar el registro, la acción no se puede deshacer",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Sí, adelante",
                            cancelButtonText: "No, espera",
                            closeOnConfirm: true
                        }, function ()
                            {
                                fsave();
                            });
                    }
                    else
                    {
                        fsave();
                    }

                    var fsave = function()
                    {
                        if (_saveCallback != null)
                        {
                            var data = [];
                            jQuery.each(jQuery('[campo]'), function (idx, val)
                            {
                                var field = val.id;
                                var value = val.value;

                                data[field] = value;
                            });
                            jQuery.each(jQuery('[campo-chk]'), function (idx, val)
                            {
                                var field = val.id;
                                var value = val.checked;

                                data[field] = value;
                            });

                            _saveCallback(data);
                        }
                    }
                }).removeAttr('save-click-button');
            });

            jQuery.each(jQuery('button[cancel-click-button]'), function (idx, val)
            {
                jQuery(this).on('click', function ()
                {
                    if (_cancelCallback != null)
                    {
                        _cancelCallback(_data);
                    }
                }).removeAttr('cancel-click-button');
            });

            jQuery.each(jQuery('button[delete-click-button]'), function (idx, val)
            {
                jQuery(this).on('click', function ()
                {
                    if (_deleteWantsConfirmation)
                    {
                        swal({
                            title: "¿Está seguro?",
                            text: "Se va a eliminar el registro, la acción no se puede deshacer",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Sí, adelante",
                            cancelButtonText: "No, espera",
                            closeOnConfirm: true
                        }, function ()
                        {
                            if (_deleteCallback != null)
							{
								var data = [];
								jQuery.each(jQuery('[campo]'), function (idx, val)
								{
									var field = val.id;
									var value = val.value;
								
									data[field] = value;
								});
								jQuery.each(jQuery('[campo-chk]'), function (idx, val)
								{
									var field = val.id;
									var value = val.checked;
								
									data[field] = value;
								});
							
								
                                _deleteCallback(_data);
                            }
                        });
                    }
                    else
                    {
						if (_deleteCallback != null)
						{
							var data = [];
							jQuery.each(jQuery('[campo]'), function (idx, val)
							{
								var field = val.id;
								var value = val.value;
							
								data[field] = value;
							});
							jQuery.each(jQuery('[campo-chk]'), function (idx, val)
							{
								var field = val.id;
								var value = val.checked;
							
								data[field] = value;
							});
						
						
							_deleteCallback(_data);
						}
                    }
                }).removeAttr('delete-click-button');
            });
        };
    };

    return constructor;    
} ();