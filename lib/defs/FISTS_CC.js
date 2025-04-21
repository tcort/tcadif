'use strict';

const FieldDef = require('./FieldDef');

class FISTS_CC extends FieldDef {
    constructor() {
        super({
            fieldName: 'FISTS_CC',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = FISTS_CC;
