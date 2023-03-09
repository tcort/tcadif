'use strict';

const FieldDef = require('./FieldDef');

class QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSLRDATE;
