'use strict';

const FieldDef = require('./FieldDef');

class STX_STRING extends FieldDef {
    constructor() {
        super({
            fieldName: 'STX_STRING',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = STX_STRING;
