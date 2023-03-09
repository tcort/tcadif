'use strict';

const FieldDef = require('./FieldDef');

class CQZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'CQZ',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 40,
        });
    }
}

module.exports = CQZ;
