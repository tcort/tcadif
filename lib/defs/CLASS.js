'use strict';

const FieldDef = require('./FieldDef');

class CLASS extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLASS',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CLASS;
