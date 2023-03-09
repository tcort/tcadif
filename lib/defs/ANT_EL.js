'use strict';

const FieldDef = require('./FieldDef');

class ANT_AZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_AZ',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => -90 <= parseFloat(value) && parseFloat(value) <= 90,
            normalizer: value => {
                if (parseFloat(value) > 90) {
                    value = parseFloat(value) % 90;
                    return `${value}`;
                } else if (parseFloat(value) < 0) {
                    value = 90 - (Math.abs(parseFloat(value)) % 90);
                    return `${value}`;
                }
                return value;
            },
        });
    }
}

module.exports = ANT_AZ;
