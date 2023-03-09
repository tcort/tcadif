'use strict';

const FieldDef = require('./FieldDef');

class IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'IOTA',
            dataType: 'IotaRef',
        });
    }
}

module.exports = IOTA;
