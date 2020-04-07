'use strict';
console.log('file_upload.js');

/**
 * Configuration options:
 * modalId: 'modal'
 * onFileUploadSuccess: function() {}
 * columnNameAndValidation: {}
 */
class FileUploader {
    constructor(conf) {
        this.modal = $('#' + conf['modalId'] || 'modal');
        this.onFileUploadSuccess = conf['onFileUploadSuccess'] || function() {};
        this.columnNameAndValidation = conf['columnNameAndValidation'] || {};

        this.workbook = null;
        this.dataJson = null;
        this.sheetSelectionContainer = this.modal.find('.sheet-selection-container');
        this.columnMappingContainer = this.modal.find('.column-mapping-container');

        // Event listeners
        this.modal.find('.import-file-button').on('click', this.importFile.bind(this));
    }

    setupDropzone(dropzoneSelector) {
        document.querySelector(dropzoneSelector).addEventListener('drop', this.onFileUpload.bind(this), false);
        document.querySelector(dropzoneSelector).addEventListener('dragover', this.handleDragOver.bind(this), false);
    }

    setupFileInput(fileSelector) {
        document.querySelector(fileSelector).addEventListener('change', this.onFileUpload.bind(this), false);
    }

    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    onFileUpload(e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.target.files || e.dataTransfer.files;
        var f = files[0];
        var reader = new FileReader();
        reader.onload = this.setWorkbook.bind(this);
        reader.readAsArrayBuffer(f);
    }

    setWorkbook(e) {
        var data = new Uint8Array(e.target.result);
        this.workbook = XLSX.read(data, {type: 'array'});
        this.openImportDialog();
    }

    openImportDialog() {
        this.setupSheetSelectionDropdown();
        // show modal
        this.modal.modal();
    }

    setupSheetSelectionDropdown() {
        this.sheetSelectionContainer.empty();

        // Create new select populated with sheet names
        var sheetSelect = $('<select class="sheet-selection-select form-control"></select>').appendTo(this.sheetSelectionContainer);
        var selected;
        this.workbook.SheetNames.forEach(function(sheet, i) {
            selected = i===0 ? 'selected' : '';
            $(`<option value="${sheet}" ${selected}>${sheet}</option>`).appendTo(sheetSelect);
        });
        // Add eventlistener for sheet selection
        sheetSelect.on('change', this.setupColumnMappingDropdowns.bind(this));

        // trigger initial change event on sheet selection
        const e = new Event("change");
        sheetSelect.get(0).dispatchEvent(e);
    }

    setupColumnMappingDropdowns(e) {
        this.modal.find('.import-file-button').prop('disabled', true);
        this.columnMappingContainer.empty();

        var sheet = e.target.value;
        this.dataJson = XLSX.utils.sheet_to_row_object_array(this.workbook.Sheets[sheet]);
        var inputColumns = [];
        for (const inputColumn in this.dataJson[0]) {
            inputColumns.push(inputColumn);
        }
        var inputColum, selected;
        for (const outputColumn in this.columnNameAndValidation) {
            // Add select input for column mapping
            $(`<span><small>${outputColumn}</small></span>`).appendTo(this.columnMappingContainer);
            var columnSelect = $(`<select data-output-column="${outputColumn}" class="mapping-column-select form-control"></select>`).appendTo(this.columnMappingContainer);
            $(`<option value="initial" style="display:none"></option>`).appendTo(columnSelect);
            for (let i=0; i<inputColumns.length; i++) {
                inputColum = inputColumns[i];
                $(`<option value="${inputColum}" ${selected}>${inputColum}</option>`).appendTo(columnSelect);
            }
            // validation message
            $(`<small class="d-block text-muted">Select column...</small>`).appendTo(this.columnMappingContainer);
            // Add eventlistener for change on mapping select
            columnSelect.on('change', function(e) {
                this.cleanColumn(e.target);
            }.bind(this));
        }


    }

    cleanColumn(selectElement) {
        var selectElement = $(selectElement);
        var inputColumn = selectElement.val();
        var outputColumn = selectElement.data('output-column');

        var columnArray = this.dataJson.map(function(row) {
            return row[inputColumn];
        })

        var validateFunc = this.columnNameAndValidation[outputColumn];
        try {
            var cleandedColumnArray = validateFunc(columnArray);
            selectElement.addClass('valid');
            selectElement.next().addClass('text-success');
            selectElement.next().removeClass('text-danger text-muted');
            selectElement.next().html('Values all valid!');
        } catch(err) {
            selectElement.removeClass('valid');
            selectElement.next().removeClass('text-success text-muted');
            selectElement.next().addClass('text-danger');
            selectElement.next().html(err);
        } finally {
            var importButton = this.modal.find('.import-file-button');
            if (this.allColumnsValid()) {
                importButton.prop('disabled', false);
            } else {
                importButton.prop('disabled', true);
            }
        }
        return cleandedColumnArray;
    }

    importFile() {
        // Create dataJson with selected columns
        // 0) Hide modal
        this.modal.modal('hide');

        // 1) Create mapping
        var columnMapping = {};
        var allColumnSelectElements = this.columnMappingContainer.children('select');
        allColumnSelectElements.each(function(index, selectElement) {
            columnMapping[$(selectElement).data('output-column')] = $(selectElement).val(); // output column : input column
        });

        // 2) Create new dataJson
        var mappedDataJson = [];
        for (var i=0; i<this.dataJson.length; i++) {
            mappedDataJson.push({});
            for (const [outputColumn, inputColumn] of Object.entries(columnMapping)) {
                mappedDataJson[i][outputColumn] = this.dataJson[i][inputColumn];
              }
        }

        // 3) Call import success callback with transformed Data
        this.onFileUploadSuccess(mappedDataJson);
    }

    allColumnsValid() {
        var allColumnSelectElements = this.columnMappingContainer.children('select').get();
        var allValid = allColumnSelectElements.every(function(el) {
            return el.classList.contains('valid');
        });
        return allValid;
    }

}

/*
Example excel download
*/
$('.download-example-excel').on('click', function() {
    var wb = XLSX.utils.book_new();
    var citiesExampleData = [
        {'Name': 'London', 'Lat': 51.509865, 'Lon': -0.118092, 'Cvar': 43},
        {'Name': 'Berlin', 'Lat': 52.520008, 'Lon': 13.404954, 'Cvar': 190},
        {'Name': 'Budapest', 'Lat': 47.497913, 'Lon': 19.040236, 'Cvar': -104},
        {'Name': 'Bern', 'Lat': 46.948, 'Lon': 7.4474, 'Cvar': 7},
        {'Name': 'Moskau', 'Lat': 55.751244, 'Lon': 37.618423, 'Cvar': -67},
    ];
    var ws1 = XLSX.utils.json_to_sheet(citiesExampleData);
    XLSX.utils.book_append_sheet(wb, ws1, "cities");
    var flawedExampleData = [
        {'Name': 'London', 'Lat': -151.509865, 'Lon': -0.118092, 'Cvar': 43},
        {'Name': 'Berlin', 'Lat': 52.520008, 'Lon': 13.404954, 'Cvar': 190},
        {'Name': ' ', 'Lat': 47.497913, 'Lon': 19.040236, 'Cvar': -104},
        {'Name': 'Bern', 'Lat': 46.948, 'Lon': 187.4474, 'Cvar': 7},
        {'Name': 'Moskau', 'Lat': 55.751244, 'Lon': 37.618423, 'Cvar': 'Mos'},
    ];
    var ws2 = XLSX.utils.json_to_sheet(flawedExampleData);
    XLSX.utils.book_append_sheet(wb, ws2, "cities_flawed");
    XLSX.writeFile(wb, "example.xlsx");
});