'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = EQSL_QSLRDATE;
