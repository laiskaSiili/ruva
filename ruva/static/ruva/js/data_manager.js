'use strict';
console.log('data_manager.js');

class DataManager {
    constructor() {
        this.data = {};
        this.getters = {};
        this.setters = {};
        this.ajaxParams = {
            method: "GET",
            url: "",
            dataType: "json",
            headers: {},
            data: {},
            success: this.onAjaxSuccessUpdateData.bind(this),
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(`ERROR - Status: ${textStatus} | ${errorThrown}`)
            },
          };
    }

    addDataGetter(name, func) {
        Object.assign(this.getters, {[name]: func}); // Update getters object
    }

    addDataSetter(name, func) {
        Object.assign(this.setters, {[name]: func}); // Update getters object
    }

    getData(name) {
        console.log(`getData(${name})`)
        return this.getters[name](this.data);
    }

    setData(name, data) {
        this.data = this.setters[name](data);
    }

    onAjaxSuccessUpdateData(response) {
        console.log('Remote data loaded');
        this.data = response;
    }

    updateAjaxParams(params) {
        // Make sure onAjaxSuccessUpdateData is always called to update internal data
        // if custom success callback is provided;
        var customSuccessCallback = params['success'];
        if (customSuccessCallback !== undefined) {
            params['success'] = function(response) {
                this.onAjaxSuccessUpdateData(response);
                customSuccessCallback(response);
            }.bind(this)
        }
        Object.assign(this.ajaxParams, params); // Update ajaxParams object
    }

    updateDataFromRemote() {
        console.log('Loading remote data');
        $.ajax(this.ajaxParams);
    }

    updateDataFromLocal(data) {
        console.log('Local data loaded');
        this.data = data;
    }

}