'use strict';

const FieldDef = require('./FieldDef');

class MY_FISTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_FISTS',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = MY_FISTS;
