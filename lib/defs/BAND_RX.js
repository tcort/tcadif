'use strict';

const FieldDef = require('./FieldDef');

class BAND_RX extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND_RX',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = BAND_RX;
