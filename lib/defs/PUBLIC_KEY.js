'use strict';

const FieldDef = require('./FieldDef');

class PUBLIC_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'PUBLIC_KEY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PUBLIC_KEY;
