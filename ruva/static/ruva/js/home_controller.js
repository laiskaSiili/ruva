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
            { 'title': 'Name', 'data': 'properties.name', render(data, type, row, meta) {
                return `<div class="d-flex align-items-center"><i class="zoom-to-asset mr-1 material-icons">zoom_in</i><span>${data}</span></div>`
            }},
            { 'title': 'Lat/Lon', 'data': 'geometry.coordinates' },
            { 'title': 'CVaR', 'data': 'properties.cvar' },
        ],
    });

    table.onRowClick(onTableRowClick);
    table.onSearchInputChange(onTableSearchInputChange);
    map.onFeatureClick(onFeatureClick, onBackgroundClick);
    map.onFeatureDblClick(onFeatureDblClick, onBackgroundClick);

    $(table.tableEl).on('click', '.zoom-to-asset', onClickZoomToAsset);
});

function onTableInitComplete() {
    // Update vector layer from table data
    map.updateLayerFromGeoJson(table.getRawDataJson());
}

function onTableRowClick(e) {
    //console.log('onTableRowClick');
    let rowElement = $(e.currentTarget);
    let rowData = table.getRowDataFromElement(rowElement);
    let id = rowData.properties.pk
    highlightById(id);
}

function onFeatureClick(e, feature) {
    //console.log('onFeatureClick');
    e.stopPropagation();
    let id = feature.get('pk');
    highlightById(id);
}

function onFeatureDblClick(e, feature) {
    console.log('onFeatureDblClick');
    e.stopPropagation();
    onFeatureClick(e, feature);
    map.zoomToFeatures([feature]);
}

function onBackgroundClick(e) {
    //console.log('onBackgroundClick')
    removeHighlight();
}

function highlightById(id) {
    //console.log(`highlightById(${id})`);
    table.highlightRows(table.getRowsByAttribute('properties.pk', id));
    map.highlightAssetFeatures(map.getFeaturesByAttribute('pk', id));
}

function removeHighlight() {
    //console.log('removeHighlight');
    // Highlight row with a certainly non-existing pk of -1,
    // effectively unselecting all features.
    highlightById(-1);
}

function onClickZoomToAsset(e) {
    let rowEl = $(e.target).closest('tr');
    let rowData = table.getRowDataFromElement(rowEl);
    let id = rowData.properties.pk;
    map.zoomToFeatures(map.getFeaturesByAttribute('pk', id));
}

function onTableSearchInputChange(e) {
    let visibleRows = table.getRowsElementsWithSearchApplied();


}