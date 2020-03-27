'use strict';

console.log('map.js');

/**
 * Configuration options:
 * targetId: 'map'
 * initZoom: 4
 * initCenter: [0, 0]
 *
 */
class OLMapWrapper {
    constructor(conf) {
        this.conf = conf;
        // Define styles
        this.initStyles();
        // Initialize layers and map
        this.initLayers();
        // Initialize View
        this.initView();
        // Initialize Controls
        this.initResetZoomControl();
        // Initialized Map
        this.map = new ol.Map({
            target: conf['targetId'],
            layers: [
                this.assetLayer,
                this.osmLayer,
            ],
            view: this.view,
            controls: ol.control.defaults().extend([this.resetZoomControl])
        });

        // add highlight interaction
        // this.selectAssetInteraction = new ol.interaction.Select({
        //     condition: ol.events.condition.click,
        //     layers: [this.assetLayer],
        //     style: this.highlightedAssetStyle
        //   });
        // this.map.addInteraction(this.selectAssetInteraction);
    }

    initResetZoomControl() {
        let container = $('<div></div>')
        container.addClass('ol-control ol-unselectable')
        container.css({
            'top': '70px',
            'left': '.5em',
        });
        let button = $('<button type="button" title="Reset zoom"><i class="material-icons">zoom_out_map</i></button>');
        button.attr('id', 'reset-zoom-control')
        button.appendTo(container);

        this.resetZoomControl = new ol.control.Control({
            element: container.get(0)
        });

        button.on('click', this.zoomToAllFeatures.bind(this));
    }

    initStyles() {
        this.assetStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({
                    color: '#ff0000'
                })
            })
        })
        this.highlightedAssetStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        })
    }

    initView() {
        this.view = new ol.View({
            center: ol.proj.fromLonLat(this.conf['initCenter'] || [0, 0]),
            zoom: this.conf['initZoom'] || 4,
            projection: 'EPSG:3857',
        })
    }

    initLayers() {
        this.osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            zIndex: 0,
        })
        this.assetLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                projection: 'EPSG:3857'
            }),
            zIndex: 1,
            style: this.assetStyle
        });
    }

    updateLayerFromGeoJson(geojson) {
        this.assetLayer.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}));
        this.zoomToAllFeatures();
    }

    getFeaturesByAttribute(attrName, attrValue) {
        let allFeatures = this.assetLayer.getSource().getFeatures();
        let selectedFeatures = [];
        for (const feature of allFeatures) {
            if (feature.get(attrName) == attrValue) {
                selectedFeatures.push(feature);
            }
        }
        return selectedFeatures
    }

    highlightAssetFeatures(features) {
        let allFeatures = this.assetLayer.getSource().getFeatures();
        for (const feature of allFeatures) {
            feature.setStyle(this.assetStyle);
        }
        for (const feature of features) {
            feature.setStyle(this.highlightedAssetStyle);
        }
    }

    onFeatureClick(featureCallback, backgroundCallback) {
        this.map.on('singleclick', function(e) {
            this._featureClickHandling(e, featureCallback, backgroundCallback)
        }.bind(this));
    }

    onFeatureDblClick(featureCallback, backgroundCallback) {
        this.map.on('dblclick', function(e) {
            this._featureClickHandling(e, featureCallback, backgroundCallback)
        }.bind(this));
    }

    _featureClickHandling(e, featureCallback, backgroundCallback) {
        let feature = this.map.forEachFeatureAtPixel(e.pixel, function(feature) { return feature; });
        if (feature) {
            let isAssetFeature = this.assetLayer.getSource().hasFeature(feature);
            if (isAssetFeature) {
                featureCallback(e, feature);
                return;
            }
        }
        backgroundCallback(e);
    };

    zoomToAllFeatures() {
        this.map.getView().fit(
            this.assetLayer.getSource().getExtent(),
            {duration: 500, padding: [20, 20, 20, 20]}
        );
    }

    zoomToFeatures(features) {
        let extent = features[0].getGeometry().getExtent();
        for (const feature of features) {
            ol.extent.extend(extent, feature.getGeometry().getExtent());
        }
        this.map.getView().fit(
            extent,
            {duration: 500, maxZoom: 10, padding: [20, 20, 20, 20]}
        );
    }

}