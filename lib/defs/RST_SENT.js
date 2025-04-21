'use strict';

const FieldDef = require('./FieldDef');

class RST_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'RST_SENT',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = RST_SENT;
