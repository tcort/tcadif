'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_LICW extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_LICW',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = APP_TCADIF_LICW;
