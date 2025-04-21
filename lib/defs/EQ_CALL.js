'use strict';

const FieldDef = require('./FieldDef');

class EQ_CALL extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQ_CALL',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQ_CALL;
