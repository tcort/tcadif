'use strict';

const FieldDef = require('./FieldDef');

class SOTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'SOTA_REF',
            dataType: 'SotaRef',
        });
    }
}

module.exports = SOTA_REF;
