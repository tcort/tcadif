'use strict';

const FieldDef = require('./FieldDef');

class MY_CQ_ZONE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CQ_ZONE',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 40,
        });
    }
}

module.exports = MY_CQ_ZONE;
