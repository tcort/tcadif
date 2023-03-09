'use strict';

const FieldDef = require('./FieldDef');

class RIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'RIG',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = RIG;
