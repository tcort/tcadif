'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import DigitDataType from './DigitDataType.mjs';

class TimeDataType extends DataType {

    static get dataTypeIndicator() {
        return 'T';
    }

    static validate(value) {

        const expectedLengths = [ 4, 6 ];

        if (typeof value !== 'string') {
            throw new AdifError('value not valid for TimeDataType', { value });
        }

        const length = value.length;
        if (!expectedLengths.includes(length)) {
            throw new AdifError('length not valid for TimeDataType', { value, length, expectedLengths });
        }

        value.split('').forEach(ch => DigitDataType.validate(ch));

        const hour = parseInt(value.slice(0, 2));
        const minHour = 0;
        const maxHour = 59;
        if (!(minHour <= hour && hour <= maxHour)) {
            throw new AdifError('hour outside of range for TimeDataType', { value, hour, minHour, maxHour });
        }

        const minute = parseInt(value.slice(2, 4));
        const minMinute = 0;
        const maxMinute = 59;
        if (!(minMinute <= hour && hour <= maxMinute)) {
            throw new AdifError('minute outside of range for TimeDataType', { value, minute, minMinute, maxMinute });
        }

        if (length == 6) {
            const second = parseInt(value.slice(4, 6));
            const minSecond = 0;
            const maxSecond = 59;
            if (!(minSecond <= second && second <= maxSecond)) {
                throw new AdifError('second outside of range for TimeDataType', { value, second, minSecond, maxSecond });
            }
        }

        return true;
    }

}

export default TimeDataType;
