'use strict';

const FieldDef = require('./FieldDef');

class MY_GRIDSQUARE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_GRIDSQUARE',
            dataType: 'GridSquare',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_GRIDSQUARE;
