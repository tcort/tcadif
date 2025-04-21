'use strict';

const FieldDef = require('./FieldDef');

class PROGRAMVERSION extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROGRAMVERSION',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PROGRAMVERSION;
