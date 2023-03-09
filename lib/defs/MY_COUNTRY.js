'use strict';

const FieldDef = require('./FieldDef');

class MY_COUNTRY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_COUNTRY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_COUNTRY;
