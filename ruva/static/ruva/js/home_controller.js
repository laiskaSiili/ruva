'use strict';

console.log('controller.js')

var map, table;

$(document).ready(function() {
    console.log('init');

    map = new OLMapWrapper({
        'targetId': 'map',
        'initCenter': [8, 47],
        'initZoom': 6
    })

    table = new DataTableWrapper({
        'targetId': 'table',
        'ajaxUrl': tableDataApiEndpoint, // global variable defined in html script tag
        'ajaxDataSrc': 'features',
        'initComplete': onTableInitComplete,
        'columns': [
            { 'title': 'Name', 'data': 'properties.name' },
            { 'title': 'Lat/Lon', 'data': 'geometry.coordinates' },
            { 'title': 'CVaR', 'data': 'properties.cvar' },
        ],
    });
});

function onTableInitComplete() {
    // Update vector layer from table data
    map.updateLayerFromGeoJson(table.getRawDataJson());
}
