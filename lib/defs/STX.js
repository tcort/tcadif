'use strict';

const FieldDef = require('./FieldDef');

class STX extends FieldDef {
    constructor() {
        super({
            fieldName: 'STX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = STX;
