'use strict';

const FieldDef = require('./FieldDef');

class MY_WWFF_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_WWFF_REF',
            dataType: 'WwffRef',
        });
    }
}

module.exports = MY_WWFF_REF;
