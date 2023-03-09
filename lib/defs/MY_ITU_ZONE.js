'use strict';

const FieldDef = require('./FieldDef');

class MY_ITU_ZONE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ITU_ZONE',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 90,
        });
    }
}

module.exports = MY_ITU_ZONE;
