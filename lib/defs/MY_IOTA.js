'use strict';

const FieldDef = require('./FieldDef');

class MY_IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_IOTA',
            dataType: 'IotaRef',
        });
    }
}

module.exports = MY_IOTA;
