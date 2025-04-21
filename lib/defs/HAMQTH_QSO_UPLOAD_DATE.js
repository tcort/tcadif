'use strict';

const FieldDef = require('./FieldDef');

class HAMQTH_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMQTH_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HAMQTH_QSO_UPLOAD_DATE;
