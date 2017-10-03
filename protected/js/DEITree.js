var DEITree = function ()
{
    var _config = {};
    var _data = null;
    var _saveCallback = null;
    var _cancelCallback = null;
    var _selId = "";
    var _selDesc = "";

    this.clickButtonOk = function ()
    {
        if (_saveCallback)
        {
            _saveCallback(_selId, _selDesc);
        }
    }

    this.clickButtonCancel = function ()
    {
        if (_cancelCallback)
        {
            _cancelCallback();
        }
    }

    var constructor = function DEITree (uniqueId, tittle)
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
            //Formulario
            embed += '<div class="row">';

            embed += '<div id="tree"></div>';
            
            embed += '</div>';

            embed += '</div>';

            embed += '<div class="modal-footer">';
            embed += '<button save-click-button type="button" class="pull-left btn bgm-lightgreen waves-effect" data-dismiss="modal" onclick="clickButtonOk()">Aceptar <i class="md md-done"></i></button>';
            embed += '<button cancel-click-button type="button" class="btn bgm-indigo waves-effect" data-dismiss="modal" onclick="clickButtonCancel()">Cancelar <i class="md md-clear"></i></button>';                
            embed += '</div>';

            embed += '</div>';
            embed += '</div>';
            embed += '</div>';

            $('body').append(embed);
            $('#' + _config.uniqueId).modal('show');

            $('#tree').treeview({
                data: _data,
                onNodeSelected: function (event, data)
                {
                    _selId = data.idcategoria;
                    _selDesc = data.text;
                }
            });

            $('#tree').treeview('collapseAll', { silent: true });
        };
    };

    return constructor;    
} ();