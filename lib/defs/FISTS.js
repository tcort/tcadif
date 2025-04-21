'use strict';

const FieldDef = require('./FieldDef');

class FISTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'FISTS',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = FISTS;
