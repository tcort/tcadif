'use strict';

const FieldDef = require('./FieldDef');

class MY_SOTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SOTA_REF',
            dataType: 'SotaRef',
        });
    }
}

module.exports = MY_SOTA_REF;
