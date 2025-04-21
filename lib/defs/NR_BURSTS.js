'use strict';

const FieldDef = require('./FieldDef');

class NR_BURSTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'NR_BURSTS',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = NR_BURSTS;
