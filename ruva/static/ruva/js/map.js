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
        // Initialize Layer Groups
        this.initLayerGroups();
        // Initialize View
        this.initView();
        // Initialize Controls
        this.initResetZoomControl();
        // Initialized Map
        this.map = new ol.Map({
            target: conf['targetId'],
            layers: [
                this.dataLayerAssets,
                this.dataLayerCountryGdp,
                this.dataLayerCountryPop,
                this.baseLayerStamen,
                this.baseLayerOsm,
            ],
            view: this.view,
            controls: ol.control.defaults().extend([this.resetZoomControl])
        });

        // LAYERSWITCH
        this.initBaseLayerswitch('.base-layerswitch-container');
        this.initDataLayerswitch('.data-layerswitch-container')
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
        this.baseLayerOsm = new ol.layer.Tile({
            title: 'OSMStandard',
            source: new ol.source.OSM(),
            zIndex: 0,
        })
        this.baseLayerStamen = new ol.layer.Tile({
            title: 'StamenTerrain',
            zIndex: 0,
            source: new ol.source.XYZ({
                url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
                attributions: '<a href="http://stamen.com">Stamen Design</a>'
            }),
        })
        this.dataLayerAssets = new ol.layer.Vector({
            title: 'asset',
            zIndex: 1,
            style: this.assetStyle,
            source: new ol.source.Vector({
                projection: 'EPSG:3857'
            }),
        });
        this.dataLayerCountryGdp = new ol.layer.Image({
            title: 'countryGdp',
            zIndex: 1,
            source: new ol.source.ImageWMS({
                url: 'http://142.93.96.220/cgi-bin/qgis_mapserv.fcgi',
                params: {'LAYERS': ['gdp']},
                serverType: 'qgis',
                projection: 'EPSG:3857',
            }),
        });
        this.dataLayerCountryPop = new ol.layer.Image({
            title: 'countryPop',
            zIndex: 1,
            source: new ol.source.ImageWMS({
                url: 'http://142.93.96.220/cgi-bin/qgis_mapserv.fcgi',
                params: {'LAYERS': ['population']},
                serverType: 'qgis',
                projection: 'EPSG:3857',
            }),
        })
    }

    initLayerGroups() {
        this.baseLayerGroup = new ol.layer.Group({
            layers: [
                this.baseLayerOsm, this.baseLayerStamen
            ]
        });
        this.dataLayerGroup = new ol.layer.Group({
            layers: [
                this.dataLayerAssets, this.dataLayerCountryGdp, this.dataLayerCountryPop
            ]
        });
    }

    updateLayerFromGeoJson(geojson, replace=true) {
        if (replace) {
            this.dataLayerAssets.getSource().clear();
        }
        this.dataLayerAssets.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}));
        this.zoomToAllFeatures();
    }

    getFeaturesByAttribute(attrName, attrValue) {
        let allFeatures = this.dataLayerAssets.getSource().getFeatures();
        let selectedFeatures = [];
        for (const feature of allFeatures) {
            if (feature.get(attrName) == attrValue) {
                selectedFeatures.push(feature);
            }
        }
        return selectedFeatures
    }

    highlightAssetFeatures(features) {
        let allFeatures = this.dataLayerAssets.getSource().getFeatures();
        for (const feature of allFeatures) {
            feature.setStyle(this.assetStyle);
        }
        for (const feature of features) {
            feature.setStyle(this.highlightedAssetStyle);
        }
    }

    toggleVisibilityOfAssetFeatures(features, hidden) {
        for (const feature of features) {
            if (hidden) {
                feature.setStyle(new ol.style.Style({}));
            } else {
                feature.setStyle(this.assetStyle);
            }
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
            let isAssetFeature = this.dataLayerAssets.getSource().hasFeature(feature);
            if (isAssetFeature) {
                featureCallback(e, feature);
                return;
            }
        }
        backgroundCallback(e);
    };

    zoomToAllFeatures() {
        this.map.getView().fit(
            this.dataLayerAssets.getSource().getExtent(),
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


    // LAYER SWITCH
    layerVisibilityByTitle(title, visible) {
        this.map.getLayers().forEach(function(layer) {
            layer.setVisible(layer.get('title')===title);
        });
    }

    initBaseLayerswitch(layerswitchContainerSelector) {
        let selectedLayerTitle, layerTitle;
        $(layerswitchContainerSelector).find('input[type=radio]').on('change', function(e) {
            selectedLayerTitle = e.target.value;
            this.baseLayerGroup.getLayers().forEach(function(layer) {
                layerTitle = layer.get('title');
                layer.setVisible(layerTitle===selectedLayerTitle); // Set layer visible if title matches selected title.
            });
        }.bind(this));
        // Add checked property to first radio option and simulate change event to make layer visible.
        $(layerswitchContainerSelector).find('input[type=radio]').first().prop('checked', true).trigger('change');
    }

    initDataLayerswitch(layerswitchContainerSelector) {
        let selectedLayerTitle, layerTitle;
        $(layerswitchContainerSelector).find('input[type=radio]').on('change', function(e) {
            selectedLayerTitle = e.target.value;
            this.dataLayerGroup.getLayers().forEach(function(layer) {
                layerTitle = layer.get('title');
                layer.setVisible(layerTitle===selectedLayerTitle); // Set layer visible if title matches selected title.
            });
        }.bind(this));
        // Add checked property to first radio option and simulate change event to make layer visible.
        $(layerswitchContainerSelector).find('input[type=radio]').first().prop('checked', true).trigger('change');
    }

}