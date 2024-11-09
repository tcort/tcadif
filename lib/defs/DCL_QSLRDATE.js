'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = DCL_QSLRDATE;
