'use strict';

const FieldDef = require('./FieldDef');

class CONTACTED_OP extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONTACTED_OP',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = CONTACTED_OP;
