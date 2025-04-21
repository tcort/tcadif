'use strict';

const FieldDef = require('./FieldDef');

class QSL_RCVD_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_RCVD_VIA',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslVia',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_RCVD_VIA;
