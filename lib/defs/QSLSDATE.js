'use strict';

const FieldDef = require('./FieldDef');

class QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSLSDATE;
