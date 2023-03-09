'use strict';

const FieldDef = require('./FieldDef');

class COMMENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'COMMENT',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = COMMENT;
