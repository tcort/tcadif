'use strict';

const FieldDef = require('./FieldDef');

class GRIDSQUARE_EXT extends FieldDef {
    constructor() {
        super({
            fieldName: 'GRIDSQUARE_EXT',
            dataType: 'GridSquareExt',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = GRIDSQUARE_EXT;
