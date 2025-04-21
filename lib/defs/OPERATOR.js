'use strict';

const FieldDef = require('./FieldDef');

class OPERATOR extends FieldDef {
    constructor() {
        super({
            fieldName: 'OPERATOR',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = OPERATOR;
