var DEIList = function ()
{
    var _config = {};
    var _data = null;
    var _saveCallback = null;
    var _cancelCallback = null;

    this.clickButtonListaOk = function (id)
    {
        var kname = Object.keys(_data[id])[0];
        var vname = Object.keys(_data[id])[1];

        var vk = _data[id][kname];
        var vn = _data[id][vname];

        if (_saveCallback)
        {
            _saveCallback(vk, vn);
        }
    }

    this.doFiltroList = function ()
    {
        var value = $("#idFiltroDlgList").val().toUpperCase();

        $('#idListGroup').empty();

        var vname = Object.keys(_data[0])[1];

        for (var i = 0; i < _data.length; i++)
        {
            var texto = _data[i][vname];

            if (texto.toUpperCase().indexOf(value) != -1)
            {
                var embed = '<a href="#" class="list-group-item" onclick="clickButtonListaOk(' + i + ')">' + texto + '</a>';

                $('#idListGroup').append(embed);
            }
        }
    }

    this.clickButtonCancel = function ()
    {
        if (_cancelCallback)
        {
            _cancelCallback();
        }
    }

    var constructor = function DEIList (uniqueId, tittle)
    {
        _config.uniqueId = uniqueId;
        _config.tittle = tittle;

        this.setCancelButton = function (b, callback)
        {
            _config.cancelButton = b;
            _cancelCallback = callback;
            return this;
        };

        this.setSaveButton = function (callback)
        {
            _saveCallback = callback;
            return this;
        };

        this.setJsonData = function (data)
        {
            _data = data;
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
            embed += '<div class="modal-dialog _modal-dialog-fullscreen modal-md" role="document">';
            embed += '<div class="modal-content _modal-content-fullscreen">';
            embed += '<div class="modal-header">';
            embed += '<button type="button" class="close" data-dismiss="modal" aria-label="Cancelar"><span aria-hidden="true">&times; </span></button>';
            embed += '<h4 class="modal-title" id="' + _config.uniqueId + '">' + _config.tittle + '</h4>';
            embed += '</div>';
            embed += '<div class="modal-body">';

            //Filtro
            embed += '<br/><form role="form">';

            embed += '<div class="form-group">';
            embed += '<label for="idFiltro">Filtro</label>';
            embed += '<input type="text" class="form-control" id="idFiltroDlgList" onkeyup="doFiltroList();" placeholder="Filtro">';
            embed += '</div>';

            //Formulario
            embed += '<div class="row">';

            embed += '<div class="list-group" id="idListGroup">';

            var kname = Object.keys(_data[0])[0];
            var vname = Object.keys(_data[0])[1];

            for (var i = 0; i < _data.length; i++)
            { 
                embed += '    <a href="#" class="list-group-item" onclick="clickButtonListaOk(' + i + ')">' + _data[i][vname] + '</a>';
            }
            embed += '</div>';

            embed += '</div>';

            embed += '</div>';
            embed += '<div class="modal-footer">';

            //embed += '<button save-click-button type="button" class="pull-left btn bgm-lightgreen waves-effect" data-dismiss="modal" onclick="clickButtonListaOk()">Aceptar <i class="md md-done"></i></button>';
            
            embed += '<button cancel-click-button type="button" class="btn bgm-indigo waves-effect" data-dismiss="modal" onclick="clickButtonCancel()">Cancelar <i class="md md-clear"></i></button>';
                
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';

            $('body').append(embed);
            $('#' + _config.uniqueId).modal('show');
        };
    };

    return constructor;    
} ();