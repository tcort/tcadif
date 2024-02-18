'use strict';

const FieldDef = require('./FieldDef');

class RX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'RX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
            normalizer: value =>
                value
                        .replace(/^kw?$/i, '1000')
                        .replace(/T/gi, '0')
                        .replace(/A/gi, '1')
                        .replace(/U/gi, '2')
                        .replace(/V/gi, '3')
                        .replace(/E/gi, '5')
                        .replace(/G/gi, '7')
                        .replace(/D/gi, '8')
                        .replace(/N/gi, '9')
            ,
        });
    }
}

module.exports = RX_PWR;
