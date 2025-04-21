'use strict';

const FieldDef = require('./FieldDef');

class QSL_SENT_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_SENT_VIA',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslVia',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_SENT_VIA;
