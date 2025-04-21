'use strict';

const FieldDef = require('./FieldDef');

class POTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'POTA_REF',
            dataType: 'PotaRefList',
        });
    }
}

module.exports = POTA_REF;
