'use strict';

const FieldDef = require('./FieldDef');

class SAT_NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'SAT_NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SAT_NAME;
