'use strict';

const FieldDef = require('./FieldDef');

class LAT extends FieldDef {
    constructor() {
        super({
            fieldName: 'LAT',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LAT;
