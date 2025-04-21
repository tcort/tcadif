'use strict';

const FieldDef = require('./FieldDef');

class IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'IOTA',
            dataType: 'IotaRefNo',
        });
    }
}

module.exports = IOTA;
