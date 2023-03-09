'use strict';

const FieldDef = require('./FieldDef');

class PRECEDENCE extends FieldDef {
    constructor() {
        super({
            fieldName: 'PRECEDENCE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PRECEDENCE;
