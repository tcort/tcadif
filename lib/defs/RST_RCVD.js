'use strict';

const FieldDef = require('./FieldDef');

class RST_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'RST_RCVD',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = RST_RCVD;
