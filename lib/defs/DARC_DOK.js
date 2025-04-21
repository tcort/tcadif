'use strict';

const FieldDef = require('./FieldDef');

class DARC_DOK extends FieldDef {
    constructor() {
        super({
            fieldName: 'DARC_DOK',
            dataType: 'String',
        });
    }
}

module.exports = DARC_DOK;
