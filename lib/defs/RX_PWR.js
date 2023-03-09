'use strict';

const FieldDef = require('./FieldDef');

class RX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'RX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = RX_PWR;
