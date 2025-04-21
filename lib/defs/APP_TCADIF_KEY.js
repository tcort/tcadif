'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_KEY',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'AppTcadifKey',
        });
    }
}

module.exports = APP_TCADIF_KEY;
