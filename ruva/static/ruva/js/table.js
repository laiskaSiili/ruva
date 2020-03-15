'use strict';

console.log('table.js');

$(document).ready(function() {
    initTable('table');
});

function initTable(tableId) {
    $('#' + tableId).DataTable( {
        ajax: {
            url: tableDataApiEndpoint,
            type: 'POST',
            dataSrc: 'data',
            beforeSend: function (request) {
                let csrftoken = $('[name=csrfmiddlewaretoken]').val();
                request.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        columns: [
            { 'title': 'Name', 'data': 'name' },
            { 'title': 'Lat/Lon', 'data': 'latlon' },
            { 'title': 'CVaR', 'data': 'cvar' },
        ]
    });
}