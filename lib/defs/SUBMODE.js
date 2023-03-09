'use strict';

const FieldDef = require('./FieldDef');

class SUBMODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'SUBMODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SUBMODE;
