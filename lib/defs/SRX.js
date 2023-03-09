'use strict';

const FieldDef = require('./FieldDef');

class SRX extends FieldDef {
    constructor() {
        super({
            fieldName: 'SRX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = SRX;
