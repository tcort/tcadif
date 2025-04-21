'use strict';

const FieldDef = require('./FieldDef');

class MY_RIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_RIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_RIG;
