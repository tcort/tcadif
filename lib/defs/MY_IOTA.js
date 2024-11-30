'use strict';

const FieldDef = require('./FieldDef');

class MY_IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_IOTA',
            dataType: 'IotaRefNo',
        });
    }
}

module.exports = MY_IOTA;
