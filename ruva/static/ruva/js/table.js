'use strict';

console.log('table.js');
var table;

$(document).ready(function() {
    initTable('table');
});

function initTable(tableId) {
    table = $('#' + tableId).DataTable( {
        ajax: {
            url: tableDataApiEndpoint,
            type: 'POST',
            dataType: 'json',
            dataSrc: 'features',
            beforeSend: function (request) {
                let csrftoken = $('[name=csrfmiddlewaretoken]').val();
                request.setRequestHeader("X-CSRFToken", csrftoken);
            },
        },
        initComplete: function(settings, geojson) {
            map.updateLayerFromTable(geojson);
        },
        columns: [
            { 'title': 'Name', 'data': 'properties.name' },
            { 'title': 'Lat/Lon', 'data': 'geometry.coordinates' },
            { 'title': 'CVaR', 'data': 'properties.cvar' },
        ]
    });
}