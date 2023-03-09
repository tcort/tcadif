'use strict';

const FieldDef = require('./FieldDef');

class CHECK extends FieldDef {
    constructor() {
        super({
            fieldName: 'CHECK',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CHECK;
