'use strict';

const FieldDef = require('./FieldDef');

class ITUZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'ITUZ',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 90,
        });
    }
}

module.exports = ITUZ;
