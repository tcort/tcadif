'use strict';

const FieldDef = require('./FieldDef');

class WWFF_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'WWFF_REF',
            dataType: 'WwffRef',
        });
    }
}

module.exports = WWFF_REF;
