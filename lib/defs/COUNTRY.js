'use strict';

const FieldDef = require('./FieldDef');

class COUNTRY extends FieldDef {
    constructor() {
        super({
            fieldName: 'COUNTRY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = COUNTRY;
