'use strict';

const FieldDef = require('./FieldDef');

class MY_DXCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_DXCC',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Dxcc',
        });
    }
}

module.exports = MY_DXCC;
