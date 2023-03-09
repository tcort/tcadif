'use strict';

const FieldDef = require('./FieldDef');

class CALL extends FieldDef {
    constructor() {
        super({
            fieldName: 'CALL',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = CALL;
