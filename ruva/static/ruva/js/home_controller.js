'use strict';
console.log('controller.js')

var dataManager, map, table, fileUploader, tableData;

$(document).ready(function() {
    console.log('init');

    /* -------
    Init Data Manager
    --------*/
    dataManager = new DataManager();
    dataManager.addDataGetter('getTableData', getTableData); // defined in misc.js
    dataManager.addDataGetter('getMapData', getMapData); // defined in misc.js
    dataManager.addDataSetter('setDataFromFileUpload', setDataFromFileUpload); // defined in misc.js
    // Set endpoint for initial data sourcing via ajax
    dataManager.updateAjaxParams({
        'url': tableDataApiEndpoint, // global variable defined in html script tag
        'success': initTableAndMapData
    });
    dataManager.updateDataFromRemote();

    /* -------
    Init map
    --------*/
    map = new OLMapWrapper({
        'targetId': 'map',
        'initCenter': [8, 47],
        'initZoom': 6
    })
    map.onFeatureClick(onFeatureClick, onBackgroundClick);
    map.onFeatureDblClick(onFeatureDblClick, onBackgroundClick);

    /* -------
    Init table
    --------*/
    table = new DataTableWrapper({
        'targetId': 'table',
        'columns': [
            { 'title': 'Name', 'data': 'properties.name', render(data, type, row, meta) {
                return `<div class="d-flex align-items-center"><i class="zoom-to-asset mr-1 material-icons">zoom_in</i><span>${data}</span></div>`
            }},
            //{ 'title': 'Lat/Lon', 'data': 'geometry.coordinates' },
            { 'title': 'CVaR', 'data': 'properties.cvar' },
        ],
    });
    table.onRowClick(onTableRowClick);
    table.onSearchInputChange(onTableSearchInputChange);
    $(table.tableEl).on('click', '.zoom-to-asset', onClickZoomToAsset);

    /* -------
    File uploader
    --------*/
    fileUploader = new FileUploader({
        'modalId': 'import-modal',
        'onFileUploadSuccess': onFileUploadSuccess,
        'columnNameAndValidation': {
            'name': cleanStrings, // defined in misc.js
            'cvar': cleanNumbers, // defined in misc.js
            'latitude': cleanLatitude, // defined in misc.js
            'longitude': cleanLongitude // defined in misc.js
        }
    });
    fileUploader.setupDropzone('.file-upload-container label');
    fileUploader.setupFileInput('.file-upload-container input');
});

function initTableAndMapData() {
    console.log('initTableAndMapData');
    table.replaceData(dataManager.getData('getTableData'));
    map.updateLayerFromGeoJson(dataManager.getData('getMapData'));
}

function onFileUploadSuccess(dataJson) {
    dataManager.setData('setDataFromFileUpload', dataJson);
    initTableAndMapData();
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