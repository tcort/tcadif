'use strict';

const FieldDef = require('./FieldDef');

class FREQ_RX extends FieldDef {
    constructor() {
        super({
            fieldName: 'FREQ_RX',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = FREQ_RX;
