'use strict';

const FieldDef = require('./FieldDef');

class K_INDEX extends FieldDef {
    constructor() {
        super({
            fieldName: 'K_INDEX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value) && parseInt(value) <= 9,
        });
    }
}

module.exports = K_INDEX;
