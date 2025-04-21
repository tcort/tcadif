'use strict';

const FieldDef = require('./FieldDef');

class LON extends FieldDef {
    constructor() {
        super({
            fieldName: 'LON',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LON;
