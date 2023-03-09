'use strict';

const FieldDef = require('./FieldDef');

class MY_STREET extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_STREET',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_STREET;
