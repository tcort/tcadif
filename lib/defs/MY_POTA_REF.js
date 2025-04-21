'use strict';

const FieldDef = require('./FieldDef');

class MY_POTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_POTA_REF',
            dataType: 'PotaRefList',
        });
    }
}

module.exports = MY_POTA_REF;
