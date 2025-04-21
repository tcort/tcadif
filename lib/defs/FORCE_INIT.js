'use strict';

const FieldDef = require('./FieldDef');

class FORCE_INIT extends FieldDef {
    constructor() {
        super({
            fieldName: 'FORCE_INIT',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = FORCE_INIT;
