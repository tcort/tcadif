'use strict';

const FieldDef = require('./FieldDef');

class TX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'TX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = TX_PWR;
