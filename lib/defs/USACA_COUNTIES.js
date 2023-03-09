'use strict';

const FieldDef = require('./FieldDef');

class USACA_COUNTIES extends FieldDef {
    constructor() {
        super({
            fieldName: 'USACA_COUNTIES',
            dataType: 'String',
        });
    }
}

module.exports = USACA_COUNTIES;
