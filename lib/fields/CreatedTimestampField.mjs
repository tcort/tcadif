'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';
import TimeDataType from '../datatypes/TimeDataType.mjs';

class CreatedTimestampField extends Field {

    constructor(value) {
        super(CreatedTimestampField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CREATED_TIMESTAMP';
    }

    validate(value) {
        super.validate(value);

        const length = value.length;
        const expectedLength = 15;
        if (length !== expectedLength) {
            throw new AdifError('length is invalid for field', { value, length, expectedLength });
        }

        const [ date, time ] = value.split(' ');

        DateDataType.validate(date);
        TimeDataType.validate(time);

        return true;
    }
}

export default CreatedTimestampField;
