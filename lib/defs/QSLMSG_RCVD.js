'use strict';

const FieldDef = require('./FieldDef');

class QSLMSG_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLMSG_RCVD',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = QSLMSG_RCVD;
