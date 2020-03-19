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

    table.tableEl.on( 'click', 'tbody tr',  onTableRowClick);
});

function onTableInitComplete() {
    // Update vector layer from table data
    map.updateLayerFromGeoJson(table.getRawDataJson());
}

function onTableRowClick(e) {
    // Highlight clicked row
    $('tr').removeClass('highlighted-row');
    let rowElement = $(e.currentTarget);
    rowElement.addClass('highlighted-row');
    // Highlight map feature
    let rowData = table.getRowDataFromElement(rowElement);
    map.highlightAssetFeatures('pk', rowData.properties.pk);
}