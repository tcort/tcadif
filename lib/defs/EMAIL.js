'use strict';

const FieldDef = require('./FieldDef');

class EMAIL extends FieldDef {
    constructor() {
        super({
            fieldName: 'EMAIL',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = EMAIL;
