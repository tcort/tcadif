'use strict';

const FieldDef = require('./FieldDef');

class SKCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'SKCC',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SKCC;
