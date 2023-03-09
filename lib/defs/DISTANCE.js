'use strict';

const FieldDef = require('./FieldDef');

class DISTANCE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DISTANCE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = DISTANCE;
