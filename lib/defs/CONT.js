'use strict';

const FieldDef = require('./FieldDef');

class CONT extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Continent',
        });
    }
}

module.exports = CONT;
