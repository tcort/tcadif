'use strict';

const FieldDef = require('./FieldDef');

class ANT_PATH extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_PATH',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'AntPath',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = ANT_PATH;
