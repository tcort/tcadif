'use strict';

const FieldDef = require('./FieldDef');

class HAMLOGEU_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMLOGEU_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HAMLOGEU_QSO_UPLOAD_DATE;
