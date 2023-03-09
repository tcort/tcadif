'use strict';

const FieldDef = require('./FieldDef');

class NR_PINGS extends FieldDef {
    constructor() {
        super({
            fieldName: 'NR_PINGS',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = NR_PINGS;
