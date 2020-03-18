'use strict';

console.log('table.js');

/**
 * Configuration options:
 * targetId: 'table'
 * ajaxUrl: ''
 * ajaxType: 'GET'
 * ajaxDataSrc: 'data'
 * ajaxBeforeSend: function() {}
 * initComplete: function() {}
 * columns: {}
 */
class DataTableWrapper {
    constructor(conf) {
        this.conf = conf;
        this.table = $('#' + (conf['tableId'] || 'table')).DataTable({
            ajax: {
                url: conf['ajaxUrl'] || '',
                type: conf['ajaxType'] || 'GET',
                dataType: 'json',
                dataSrc: conf['ajaxDataSrc'] || 'data',
                beforeSend: conf['ajaxDataSource'] || function() {},
            },
            initComplete: conf['initComplete'] || function() {},
            columns: conf['columns'] || {}
        })
    }

    getRawData() {
        return this.table.ajax.json();
    }

    getRawDataJson() {
        return JSON.stringify(this.getRawData())
    }
}