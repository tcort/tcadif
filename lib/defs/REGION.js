'use strict';

const FieldDef = require('./FieldDef');

class REGION extends FieldDef {
    constructor() {
        super({
            fieldName: 'REGION',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Region',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = REGION;
