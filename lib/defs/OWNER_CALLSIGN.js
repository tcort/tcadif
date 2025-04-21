'use strict';

const FieldDef = require('./FieldDef');

class OWNER_CALLSIGN extends FieldDef {
    constructor() {
        super({
            fieldName: 'OWNER_CALLSIGN',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = OWNER_CALLSIGN;
