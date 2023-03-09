'use strict';

const FieldDef = require('./FieldDef');

class MY_SIG_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SIG_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_SIG_INFO;
