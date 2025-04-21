'use strict';

const FieldDef = require('./FieldDef');

class HAMLOGEU_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMLOGEU_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HAMLOGEU_QSO_UPLOAD_STATUS;
