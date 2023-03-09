'use strict';

const FieldDef = require('./FieldDef');

class TIME_ON extends FieldDef {
    constructor() {
        super({
            fieldName: 'TIME_ON',
            dataType: 'Time',
            dataTypeIndicator: 'T',
        });
    }
}

module.exports = TIME_ON;
