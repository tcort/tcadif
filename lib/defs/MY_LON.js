'use strict';

const FieldDef = require('./FieldDef');

class MY_LON extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_LON',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_LON;
