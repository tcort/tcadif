'use strict';

const FieldDef = require('./FieldDef');

class PFX extends FieldDef {
    constructor() {
        super({
            fieldName: 'PFX',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PFX;
