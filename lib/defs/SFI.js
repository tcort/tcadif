'use strict';

const FieldDef = require('./FieldDef');

class SFI extends FieldDef {
    constructor() {
        super({
            fieldName: 'SFI',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value) && parseInt(value) <= 300,
        });
    }
}

module.exports = SFI;
