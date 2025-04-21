'use strict';

const FieldDef = require('./FieldDef');

class SWL extends FieldDef {
    constructor() {
        super({
            fieldName: 'SWL',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = SWL;
