'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = LOTW_QSLSDATE;
