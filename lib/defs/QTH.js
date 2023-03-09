'use strict';

const FieldDef = require('./FieldDef');

class QTH extends FieldDef {
    constructor() {
        super({
            fieldName: 'QTH',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = QTH;
