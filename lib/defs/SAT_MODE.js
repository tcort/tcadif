'use strict';

const FieldDef = require('./FieldDef');

class SAT_MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'SAT_MODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SAT_MODE;
