'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = DCL_QSLSDATE;
