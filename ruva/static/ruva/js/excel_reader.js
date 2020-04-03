document.getElementById('file-upload').addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, {type: 'array'});

        workbook.SheetNames.forEach(function(sheet) {
            var dataJson = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[sheet]
            );
            console.log(sheet)
            console.log(dataJson)
            console.log('------------------')
        })
    };
    reader.readAsArrayBuffer(f);
}