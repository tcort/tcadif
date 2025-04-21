'use strict';

const FieldDef = require('./FieldDef');

class IOTA_ISLAND_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'IOTA_ISLAND_ID',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 99999999,
        });
    }
}

module.exports = IOTA_ISLAND_ID;
