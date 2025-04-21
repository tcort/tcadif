'use strict';

const FieldDef = require('./FieldDef');

class NOTES extends FieldDef {
    constructor() {
        super({
            fieldName: 'NOTES',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = NOTES;
