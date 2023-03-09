'use strict';

const FieldDef = require('./FieldDef');

class SRX_STRING extends FieldDef {
    constructor() {
        super({
            fieldName: 'SRX_STRING',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SRX_STRING;
