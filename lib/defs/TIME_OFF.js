'use strict';

const FieldDef = require('./FieldDef');

class TIME_OFF extends FieldDef {
    constructor() {
        super({
            fieldName: 'TIME_OFF',
            dataType: 'Time',
            dataTypeIndicator: 'T',
        });
    }
}

module.exports = TIME_OFF;
