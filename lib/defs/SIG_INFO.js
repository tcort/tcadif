'use strict';

const FieldDef = require('./FieldDef');

class SIG_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'SIG_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SIG_INFO;
