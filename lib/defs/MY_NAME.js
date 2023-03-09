'use strict';

const FieldDef = require('./FieldDef');

class MY_NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_NAME;
