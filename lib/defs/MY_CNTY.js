'use strict';

const FieldDef = require('./FieldDef');

class MY_CNTY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CNTY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_CNTY;
