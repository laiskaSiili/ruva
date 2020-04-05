'use strict';
console.log('table.js');

/**
 * Configuration options:
 * targetId: 'table'
 * initComplete: function() {}
 * columns: {}
 */
class DataTableWrapper {
    constructor(conf) {
        this.conf = conf;
        this.tableEl = $('#' + (conf['tableId'] || 'table'));
        this.table = this.tableEl.DataTable({
            destroy: true,
            data: {},
            initComplete: conf['initComplete'] || function() {},
            columns: conf['columns'] || {}
        })

    }

    replaceData(data) {
        this.table.clear().rows.add(data).draw();
    }

    getData() {
        return this.table.rows().data();
    }

    getRowDataFromElement(rowEl) {
        return this.table.row(rowEl).data();
    }

    getRowDataFromElements(rowEls) {
        let rowsData = []
        for (const rowEl of rowEls) {
            rowsData.push(this.getRowDataFromElement(rowEl));
        }
        return rowsData;
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

    onSearchInputChange(callback) {
        this.table.on('search.dt', callback);
    }

    getRowsElementsWithSearchApplied() {
        return this.table.rows({search:'applied'}).nodes();
    }

}