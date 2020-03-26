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

    table.onRowClick(onTableRowClick);
    table.onRowDblClick(onTableRowDblClick);
    map.onFeatureClick(onFeatureClick, onBackgroundClick);
});

function onTableInitComplete() {
    // Update vector layer from table data
    map.updateLayerFromGeoJson(table.getRawDataJson());
}

function onTableRowClick(e) {
    let rowElement = $(e.currentTarget);
    let rowData = table.getRowDataFromElement(rowElement);
    let id = rowData.properties.pk
    highlightById(id);
}

function onTableRowDblClick(e) {
    let rowElement = $(e.currentTarget);
    let rowData = table.getRowDataFromElement(rowElement);
    let id = rowData.properties.pk
    map.zoomToFeatures(map.getFeaturesByAttribute('pk', id));
}

function onFeatureClick(e, feature) {
    console.log('onFeatureClick')
    let id = feature.get('pk');
    highlightById(id);
    map.zoomToFeatures([feature]);
}

function onBackgroundClick(e) {
    console.log('onBackgroundClick')
    removeHighlight();
    map.zoomToAllFeatures();
}

function highlightById(id) {
    table.highlightRows(table.getRowsByAttribute('properties.pk', id));
    map.highlightAssetFeatures(map.getFeaturesByAttribute('pk', id));
}

function removeHighlight() {
    // Highlight row with a certainly non-existing pk of -1,
    // effectively unselecting all features.
    highlightById(-1);
}