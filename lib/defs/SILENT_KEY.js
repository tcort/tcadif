'use strict';

const FieldDef = require('./FieldDef');

class SILENT_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'SILENT_KEY',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = SILENT_KEY;
