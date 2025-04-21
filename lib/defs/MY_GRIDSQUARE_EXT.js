'use strict';

const FieldDef = require('./FieldDef');

class MY_GRIDSQUARE_EXT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_GRIDSQUARE_EXT',
            dataType: 'GridSquareExt',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_GRIDSQUARE_EXT;
