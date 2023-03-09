'use strict';

const FieldDef = require('./FieldDef');

class MY_ALTITUDE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ALTITUDE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = MY_ALTITUDE;
