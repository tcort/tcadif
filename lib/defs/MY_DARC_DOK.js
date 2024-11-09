'use strict';

const FieldDef = require('./FieldDef');

class MY_DARC_DOK extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_DARC_DOK',
            dataType: 'String',
        });
    }
}

module.exports = MY_DARC_DOK;
