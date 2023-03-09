'use strict';

const FieldDef = require('./FieldDef');

class ADDRESS extends FieldDef {
    constructor() {
        super({
            fieldName: 'ADDRESS',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = ADDRESS;
