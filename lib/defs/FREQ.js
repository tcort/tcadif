'use strict';

const FieldDef = require('./FieldDef');

class FREQ extends FieldDef {
    constructor() {
        super({
            fieldName: 'FREQ',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = FREQ;
