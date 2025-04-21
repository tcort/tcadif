'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = LOTW_QSLRDATE;
