'use strict';

const FieldDef = require('./FieldDef');

class AGE extends FieldDef {
    constructor() {
        super({
            fieldName: 'AGE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 120,
        });
    }
}

module.exports = AGE;
