'use strict';

const FieldDef = require('./FieldDef');

class TEN_TEN extends FieldDef {
    constructor() {
        super({
            fieldName: 'TEN_TEN',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = TEN_TEN;
