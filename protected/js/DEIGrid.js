/*

EJEMPLO DE USO:

var formGrid = new DEIGrid("formSelectionGrid", "Seleccione...");

formGrid.setJsonData([
    { a: 11, b: 12, c: 13, d: 14 },
    { a: 21, b: 22, c: 23, d: 24 },
    { a: 31, b: 32, c: 33, d: 34 },
    { a: 41, b: 42, c: 43, d: 44 },
    { a: 'John', b: 'Smith', c: '31254254 - j', d: ' hfjsdhf kjsh fkjlshf kjsdhf' },
    { a: 'Christopher', b: 'Don Jonson', c: '31254254 - j', d: 'Lorem' },
]);

formGrid.setCancelButton(true, function ()
{

});

formGrid.setSaveButton(function (idx)
{
    formGrid.hideDialog();

    alert(idx);
});

formGrid.showDialog();

*/


var DEIGrid = function ()
{
    var _config = {};
    var _data = null;
    var _saveCallback = null;
    var _cancelCallback = null;

    this.clickButtonGridOk = function (id)
    {
        if (_saveCallback)
        {
            _saveCallback(id);
        }
    }

    
    this.doFiltro = function ()
    {
        var filtro = $("#idFiltroDlgGrid").val().toUpperCase();

        $('#idGridTable').empty();

        /*
        var vname = Object.keys(_data[0])[1];

        for (var i = 0; i < _data.length; i++)
        {
            var texto = _data[i][vname];

            if (texto.toUpperCase().indexOf(filtro) != -1)
            {
                var embed = '<a href="#" class="list-group-item" onclick="clickButtonGridOk(' + i + ')">' + texto + '</a>';

                $('#idGridGroup').append(embed);
            }
        }*/

        var embed = "";
        var names = [];
        var numNames = Object.keys(_data[0]).length;

        for (var i = 0; i < numNames; i++)
        {
            names[i] = Object.keys(_data[0])[i];
        }

        for (var i = 0; i < _data.length; i++)
        {
            var canAdd = false;

            //Cumple el filtro?
            if (filtro == '')
            {
                canAdd = true;
            }
            else
            {
                for (var j = 0; j < numNames; j++)
                {
                    var texto = _data[i][names[j]]

                    if (texto.toUpperCase().indexOf(filtro) != -1)
                    {
                        canAdd = true;
                        break;
                    }
                }
            }

            if (canAdd)
            {
                embed += '<tr onclick="clickButtonGridOk(' + i + ');">';

                for (var j = 0; j < numNames; j++)
                {
                    embed += '<td>' + _data[i][names[j]] + '</td>';
                }

                embed += '</tr>';
            }
        }

        $('#idGridTable').append(embed);
    }

    this.clickButtonCancel = function ()
    {
        if (_cancelCallback)
        {
            _cancelCallback();
        }
    }

    var constructor = function DEIGrid (uniqueId, tittle)
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
            embed += '<div class="form-group">';
            embed += '<label for="idFiltro">Filtro</label>';
            embed += '<input type="text" class="form-control" id="idFiltroDlgGrid" onkeyup="doFiltro();" placeholder="Filtro">';
            embed += '</div>';

            //Formulario
            embed += '<div class="row">';

            embed += '<table class="table table-hover"><tbody id="idGridTable">';

          

            embed += '</tbody></table>';

            embed += '</div>';

            embed += '</div>';
            embed += '<div class="modal-footer">';
            
            embed += '<button cancel-click-button type="button" class="btn bgm-indigo waves-effect" data-dismiss="modal" onclick="clickButtonCancel()">Cancelar <i class="md md-clear"></i></button>';
                
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';
            embed += '</div>';

            $('body').append(embed);

            doFiltro();

            $('#' + _config.uniqueId).modal('show');
        };
    };

    return constructor;    
} ();