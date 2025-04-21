'use strict';

const FieldDef = require('./FieldDef');

class MY_STATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_STATE',
            dataType: 'String',
        });
    }
}

module.exports = MY_STATE;
