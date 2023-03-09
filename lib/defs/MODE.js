'use strict';

const FieldDef = require('./FieldDef');

class MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MODE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Mode',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MODE;
