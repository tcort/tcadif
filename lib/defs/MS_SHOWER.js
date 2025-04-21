'use strict';

const FieldDef = require('./FieldDef');

class MS_SHOWER extends FieldDef {
    constructor() {
        super({
            fieldName: 'MS_SHOWER',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MS_SHOWER;
