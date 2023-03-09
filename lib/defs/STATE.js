'use strict';

const FieldDef = require('./FieldDef');

class STATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'STATE',
            dataType: 'String',
        });
    }
}

module.exports = STATE;
