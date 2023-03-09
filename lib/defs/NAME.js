'use strict';

const FieldDef = require('./FieldDef');

class NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = NAME;
