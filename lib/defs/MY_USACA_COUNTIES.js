'use strict';

const FieldDef = require('./FieldDef');

class MY_USACA_COUNTIES extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_USACA_COUNTIES',
            dataType: 'String',
        });
    }
}

module.exports = MY_USACA_COUNTIES;
