class FileUploader {
    constructor(modalId) {
        this.modal = $('#' + modalId);
        this.workbook = null;
        this.dataJson = null;
        this.onFileUploadSuccess = null;

        this.outputColumns = {
            'name': cleanStrings,
            'cvar': cleanNumbers,
            'latitude': cleanNumbers,
            'longitude': cleanNumbers
        }

        this.outputTransformer = function(mappedDataJson) {
            // Create GeoJson format

            var transformedDataJson = {
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

            var mappedRow, feature;
            for (var i=0; i<mappedDataJson.length; i++) {
                mappedRow = mappedDataJson[i];
                feature = JSON.parse(JSON.stringify(featureTemplate)); // Deep copy feature template
                feature.geometry.coordinates.push([mappedRow.latitude, mappedRow.longitude])
                feature.properties = {
                    'pk': i,
                    'name': mappedRow.name,
                    'cvar': mappedRow.cvar,
                }
                transformedDataJson.features.push(feature); // Append feature to geojson
            }
            return transformedDataJson;
        }

        this.sheetSelectionContainer = this.modal.find('.sheet-selection-container');
        this.columnMappingContainer = this.modal.find('.column-mapping-container');

        // Event listeners
        this.modal.find('.import-file-button').on('click', this.importFile.bind(this));

        // Functions
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
        this.modal.find('.import-file-button').prop('disabled', true);
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

        var validateFunc = this.outputColumns[outputColumn];
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

        // 3) Apply data transformation
        var transformedDataJson = this.outputTransformer(mappedDataJson);

        // 4) Call import success callback with transformed Data
        this.onFileUploadSuccess(transformedDataJson);
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