'use strict';

const FieldDef = require('./FieldDef');

class UKSMG extends FieldDef {
    constructor() {
        super({
            fieldName: 'UKSMG',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = UKSMG;
