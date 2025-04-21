'use strict';

const FieldDef = require('./FieldDef');

class SIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'SIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SIG;
