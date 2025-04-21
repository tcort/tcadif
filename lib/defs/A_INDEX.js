'use strict';

const FieldDef = require('./FieldDef');

class A_INDEX extends FieldDef {
    constructor() {
        super({
            fieldName: 'A_INDEX',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 400,
        });
    }
}

module.exports = A_INDEX;
