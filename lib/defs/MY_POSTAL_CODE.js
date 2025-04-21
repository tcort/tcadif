'use strict';

const FieldDef = require('./FieldDef');

class MY_POSTAL_CODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_POSTAL_CODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_POSTAL_CODE;
