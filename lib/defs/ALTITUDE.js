'use strict';

const FieldDef = require('./FieldDef');

class ALTITUDE extends FieldDef {
    constructor() {
        super({
            fieldName: 'ALTITUDE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = ALTITUDE;
