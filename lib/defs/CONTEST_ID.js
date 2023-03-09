'use strict';

const FieldDef = require('./FieldDef');

class CONTEST_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONTEST_ID',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CONTEST_ID;
