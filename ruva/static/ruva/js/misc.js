'use strict';
console.log('misc.js');

/* ------------------
Data Manager getter and setter functions
-------------------*/

// dataManagerData is a GeoJson. For table, extract only features array.
function getTableData(dataManagerData) {
    return dataManagerData.features;
}

// dataManagerData is a GeoJson. For map return stringified geoJson.
function getMapData(dataManagerData) {
    return JSON.stringify(dataManagerData);
}

// fileUpload returns an array of objects mapping column name to data.
// Transform this to geojson assuming point coodinates in EPSG 4326.
// Add a pk attribute to properties which acts as integer id for features.
function setDataFromFileUpload(data) {
    var geoJson = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:4326"
            }},
        "features": []
    }
    var featureTemplate =  {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": []
        }
    }
    var row, feature;
    for (var i=0; i<data.length; i++) {
        row = data[i];
        feature = JSON.parse(JSON.stringify(featureTemplate)); // Deep copy feature template
        feature.geometry.coordinates = [row.longitude, row.latitude];
        feature.properties = {'pk': Math.floor(100000000*Math.random())}
        Object.assign(feature.properties, row); // Update properties with all row data.
        geoJson.features.push(feature); // Append feature to geojson
    }
    return geoJson;
}


/* ------------------
File uploader cleaning functions
--------------------*/
function cleanStrings(columnArray) {
    var cleanedColumnArray = [];
    var v;
    for (var i=0; i<columnArray.length; i++) {
        v = columnArray[i];
        try {
            v = v.toString().trim();
        } catch (err) {
            throw `Value around row ${i+2} cannot be converted to text: ${columnArray[i]}`;
        }
        if (v === '') {
            throw `Empty value found around row ${i+2}!` // i is 0-based and starts after header
        }
        cleanedColumnArray.push(v);
    }
    return cleanedColumnArray;
}

function cleanNumbers(columnArray) {
    var cleanedColumnArray = [];
    var v;
    for (var i=0; i<columnArray.length; i++) {
        v = columnArray[i];
        if (v === undefined || v === '') {
            throw `Empty value found around row ${i+2}!` // i is 0-based and starts after header
        }
        try {
            v = parseFloat(v);
        } catch (err) {
            throw `Value around row ${i+2} cannot be converted to number: ${columnArray[i]}`;
        }
        if (isNaN(v)) {
            throw `Value around row ${i+2} cannot be converted to number: ${columnArray[i]}`;
        }
        cleanedColumnArray.push(v);
    }
    return cleanedColumnArray;
}

function cleanLatitude(columnArray) {
    columnArray = cleanNumbers(columnArray);
    for (var i=0; i<columnArray.length; i++) {
        if (columnArray[i] < -90 || columnArray[i] > 90) {
            throw `Latitude value around row ${i+2} must be within interval [-90, 90]: ${columnArray[i]}`;
        }
    }
    return columnArray;
}

function cleanLongitude(columnArray) {
    columnArray = cleanNumbers(columnArray);
    for (var i=0; i<columnArray.length; i++) {
        if (columnArray[i] < -180 || columnArray[i] > 180) {
            throw `Longitude value around row ${i+2} must be within interval [-180, 180]: ${columnArray[i]}`;
        }
    }
    return columnArray;
}