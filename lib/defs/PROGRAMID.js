'use strict';

const FieldDef = require('./FieldDef');

class PROGRAMID extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROGRAMID',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PROGRAMID;
