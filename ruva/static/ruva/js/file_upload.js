class FileUploader {
    constructor(modalId) {
        this.modal = $('#' + modalId);
        this.workbook = null;
        this.dataJson = null;

        this.outputColumns = {
            'name': cleanStrings,
            'cvar': cleanNumbers,
            'latitude': cleanNumbers,
            'longitude': cleanNumbers
        }

        this.outputTransformer = function(cleanedOutput) {

        }

        this.sheetSelectionContainer = this.modal.find('.sheet-selection-container');
        this.columnMappingContainer = this.modal.find('.column-mapping-container');

        function cleanStrings(columnArray) {
            var cleanedColumnArray = [];
            var v;
            for (var i=0; i<columnArray.length; i++) {
                v = columnArray[i];
                if (v === undefined || v == '') {
                    throw `Empty value found around row ${i+2}!` // i is 0-based and starts after header
                }
                try {
                    v = v.toString();
                    cleanedColumnArray.push(v.trim());
                } catch (err) {
                    throw `Value around row ${i+2} cannot be converted to text: ${columnArray[i]}`;
                }
            }
            return cleanedColumnArray;
        }

        function cleanNumbers(columnArray) {
            var cleanedColumnArray = [];
            var v;
            for (var i=0; i<columnArray.length; i++) {
                v = columnArray[i];
                if (v === undefined || v == '') {
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
        this.columnMappingContainer.empty();

        var sheet = e.target.value;
        this.dataJson = XLSX.utils.sheet_to_row_object_array(this.workbook.Sheets[sheet]);
        var inputColumns = [];
        for (const inputColumn in this.dataJson[0]) {
            inputColumns.push(inputColumn);
        }
        var inputColum, selected;
        for (const outputColumn in this.outputColumns) {
            // Add select input for column mapping
            $(`<span><small class="text-muted">${outputColumn}</small></span>`).appendTo(this.columnMappingContainer);
            var columnSelect = $(`<select data-output-column="${outputColumn}" class="mapping-column-select form-control"></select>`).appendTo(this.columnMappingContainer);
            for (let i=0; i<inputColumns.length; i++) {
                inputColum = inputColumns[i];
                selected = i===0 ? 'selected' : '';
                $(`<option value="${inputColum}" ${selected}>${inputColum}</option>`).appendTo(columnSelect);
            }
            // validation message
            $(`<small class="d-block"></small>`).appendTo(this.columnMappingContainer);
            // Add eventlistener for change on mapping select
            columnSelect.on('change', function(e) {
                this.cleanColumn(e.target);
            }.bind(this));
            // trigger initial change event
            const e = new Event("change");
            columnSelect.get(0).dispatchEvent(e);
        }


    }

    cleanColumn(selectElement) {
        var selectElement = $(selectElement);
        var inputColumn = selectElement.val();
        var outputColumn = selectElement.data('output-column');;

        var validateFunc = this.outputColumns[outputColumn];
        var columnArray = this.dataJson.map(function(row) {
            return row[inputColumn];
        })

        let err = null;
        try {
            var cleandedColumnArray = validateFunc(columnArray);
            selectElement.next().addClass('text-success');
            selectElement.next().removeClass('text-danger');
            selectElement.next().html('Values all valid!');
        } catch(err) {
            selectElement.next().removeClass('text-success');
            selectElement.next().addClass('text-danger');
            selectElement.next().html(err);
            throw err;
        }
        return cleandedColumnArray;
    }


    mapColumns() {

    }

}






/*
 workbook.SheetNames.forEach(function(sheet) {
    var dataJson = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheet]
    );
    //console.log(sheet)
    //console.log(dataJson)
    //console.log('------------------')

    var geoJsonTemplate = {
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
        "properties": {
            "name": "asset1",
            "cvar": -20.0,
            "pk": "4"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [8.45947265625, 48.790283203125]
        }
    }


    })
    */