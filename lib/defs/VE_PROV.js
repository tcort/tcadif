'use strict';

const FieldDef = require('./FieldDef');

class VE_PROV extends FieldDef {
    constructor() {
        super({
            fieldName: 'VE_PROV',
            dataType: 'String',
            importOnly: true,
        });
    }
}

module.exports = VE_PROV;
