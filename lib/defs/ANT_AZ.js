'use strict';

const FieldDef = require('./FieldDef');

class ANT_AZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_AZ',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 360,
            normalizer: value => {
                if (parseFloat(value) > 360) {
                    value = parseFloat(value) % 360;
                    return `${value}`;
                } else if (parseFloat(value) < 0) {
                    value = 360 - (Math.abs(parseFloat(value)) % 360);
                    return `${value}`;
                }
                return value;
            },
        });
    }
}

module.exports = ANT_AZ;
