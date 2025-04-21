'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = APP_TCADIF_KEY_INFO;
