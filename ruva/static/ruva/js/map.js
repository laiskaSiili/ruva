'use strict';

console.log('map.js');

var osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    })

var map = new ol.Map({
    target: 'map',
    layers: [
        osmLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([0, 0]),
        zoom: 4
    })
});