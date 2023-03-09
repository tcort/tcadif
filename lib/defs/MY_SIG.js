'use strict';

const FieldDef = require('./FieldDef');

class MY_SIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_SIG;
