'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_QSO_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_QSO_ID',
            dataType: 'Uuid',
        });
    }
}

module.exports = APP_TCADIF_QSO_ID;
