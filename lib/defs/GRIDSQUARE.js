'use strict';

const FieldDef = require('./FieldDef');

class GRIDSQUARE extends FieldDef {
    constructor() {
        super({
            fieldName: 'GRIDSQUARE',
            dataType: 'GridSquare',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = GRIDSQUARE;
