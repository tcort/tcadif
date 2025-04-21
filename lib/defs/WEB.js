'use strict';

const FieldDef = require('./FieldDef');

class WEB extends FieldDef {
    constructor() {
        super({
            fieldName: 'WEB',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = WEB;
