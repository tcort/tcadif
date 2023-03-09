'use strict';

const FieldDef = require('./FieldDef');

class MY_CITY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CITY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_CITY;
