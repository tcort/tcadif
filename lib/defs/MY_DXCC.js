'use strict';

const FieldDef = require('./FieldDef');

class DXCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'DXCC',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Dxcc',
        });
    }
}

module.exports = DXCC;
