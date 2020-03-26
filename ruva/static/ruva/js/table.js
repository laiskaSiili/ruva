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
        this.tableEl = $('#' + (conf['tableId'] || 'table'));
        this.table = this.tableEl.DataTable({
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

        this.table.on('search.dt', function () {
            //console.log(this.table.rows({search:'applied'}).nodes())
        }.bind(this));

    }

    getRawData() {
        return this.table.ajax.json();
    }

    getRawDataJson() {
        return JSON.stringify(this.getRawData())
    }

    getRowDataFromElement(rowEl) {
        return this.table.row(rowEl).data();
    }

    getRowsByAttribute(attrName, attrValue) {
        let rowData, rowDataValue;
        let selectedRows = [];
        this.table.rows().every( function () {
            rowData = this.data();
            rowDataValue = attrName.split('.').reduce(function(obj, i) { return obj[i]; }, rowData);
            if (rowDataValue == attrValue) {
                selectedRows.push(this);
            }
        });
        return selectedRows;
    }

    highlightRows(rows) {
        this.table.rows().every( function () {
            $(this.node()).removeClass('highlighted-row');
        });
        for (const row of rows) {
            $(row.node()).addClass('highlighted-row');
        }
    }

    onRowClick(callback) {
        this.tableEl.on('click', 'tbody tr',  callback);
    }

    onRowDblClick(callback) {
        this.tableEl.on('dblclick', 'tbody tr', callback);
    }

}