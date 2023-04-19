'use strict';

const FieldDef = require('./FieldDef');

class VUCC_GRIDS extends FieldDef {
    constructor() {
        super({
            fieldName: 'VUCC_GRIDS',
            dataType: 'GridSquareList',
            normalizer: (value) => value?.toUpperCase(),
            check: value => (value.split(/,/g).length === 2 || value.split(/,/g).length === 4) && value.split(/,/g).every(grid => grid.length === 4),
        });
    }
}

module.exports = VUCC_GRIDS;
