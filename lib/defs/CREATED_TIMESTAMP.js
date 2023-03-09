'use strict';

const FieldDef = require('./FieldDef');
const DataTypes = require('../DataTypes');

class CREATED_TIMESTAMP extends FieldDef {
    constructor() {
        super({
            fieldName: 'CREATED_TIMESTAMP',
            dataType: 'String',
            dataTypeIndicator: 'S',
            enumeration: null,
            validator: new RegExp("^[0-9]{8} [0-9]{6}$"),
            check: (value) => {
                const [ date, time ] = value.split(' ');
                return DataTypes.check('Date', date) && DataTypes.check('Time', time);
            },
        });
    }
}

module.exports = CREATED_TIMESTAMP;
