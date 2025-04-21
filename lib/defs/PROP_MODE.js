'use strict';

const FieldDef = require('./FieldDef');

class PROP_MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROP_MODE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'PropagationMode',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = PROP_MODE;
