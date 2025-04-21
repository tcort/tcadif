'use strict';

const FieldDef = require('./FieldDef');

class QSL_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_VIA',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = QSL_VIA;
