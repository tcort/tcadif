'use strict';

const FieldDef = require('./FieldDef');

class GUEST_OP extends FieldDef {
    constructor() {
        super({
            fieldName: 'GUEST_OP',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
            importOnly: true,
        });
    }
}

module.exports = GUEST_OP;
