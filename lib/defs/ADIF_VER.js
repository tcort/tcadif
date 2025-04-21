'use strict';

const FieldDef = require('./FieldDef');

class ADIF_VER extends FieldDef {
    constructor() {
        super({
            fieldName: 'ADIF_VER',
            dataType: 'String',
            dataTypeIndicator: 'S',
            enumeration: null,
            validator: new RegExp("^[0-9]+\.[0-9]\.[0-9]$"),
        });
    }
}

module.exports = ADIF_VER;
