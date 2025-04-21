'use strict';

const FieldDef = require('./FieldDef');

class MAX_BURSTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'MAX_BURSTS',
            dataType: 'Number',
            check: value => 0 <= parseFloat(value),
        });
    }
}

module.exports = MAX_BURSTS;
