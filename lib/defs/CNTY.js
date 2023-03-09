'use strict';

const FieldDef = require('./FieldDef');

class CNTY extends FieldDef {
    constructor() {
        super({
            fieldName: 'CNTY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CNTY;
