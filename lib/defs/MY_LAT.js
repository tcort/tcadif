'use strict';

const FieldDef = require('./FieldDef');

class MY_LAT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_LAT',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_LAT;
