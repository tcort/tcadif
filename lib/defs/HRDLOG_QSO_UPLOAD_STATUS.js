'use strict';

const FieldDef = require('./FieldDef');

class HRDLOG_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HRDLOG_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HRDLOG_QSO_UPLOAD_STATUS;
