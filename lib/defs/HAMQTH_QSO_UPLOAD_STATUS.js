'use strict';

const FieldDef = require('./FieldDef');

class HAMQTH_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMQTH_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HAMQTH_QSO_UPLOAD_STATUS;
