'use strict';

const FieldDef = require('./FieldDef');

class QSLMSG extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLMSG',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = QSLMSG;
