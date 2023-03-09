'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = EQSL_QSLSDATE;
