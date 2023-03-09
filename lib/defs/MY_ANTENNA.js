'use strict';

const FieldDef = require('./FieldDef');

class MY_ANTENNA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ANTENNA',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_ANTENNA;
