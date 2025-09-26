'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import DigitDataType from './DigitDataType.mjs';

class DateDataType extends DataType {

    static get dataTypeIndicator() {
        return 'D';
    }

    static isLeapYear(year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }

    static daysInMonth(year, month) {
        switch (month) {
            case  1: return 31;
            case  2: return DateDataType.isLeapYear(year) ? 29 : 28;
            case  3: return 31;
            case  4: return 30;
            case  5: return 31;
            case  6: return 30;
            case  7: return 31;
            case  8: return 31;
            case  9: return 30;
            case 10: return 31;
            case 11: return 30;
            case 12: return 31;
            default: return  0;
        }
    }

    static validate(value) {

        if (typeof value !== 'string') {
            throw new AdifError('value not valid for DateDataType', { value });
        }

        const length = value.length;
        const expectedLength = 8;
        if (expectedLength !== length) {
            throw new AdifError('length not valid for DateDataType', { value, length, expectedLength });
        }

        value.split('').forEach(ch => DigitDataType.validate(ch));

        const year = parseInt(value.slice(0, 4));
        const minYear = 1930;
        const maxYear = 9999;
        if (!(minYear <= year)) {
            throw new AdifError('year outside of range for DateDataType', { value, year, minYear, maxYear });
        }

        const month = parseInt(value.slice(4, 6));
        const minMonth = 1;
        const maxMonth = 12;
        if (!(minMonth <= month && month <= maxMonth)) {
            throw new AdifError('month outside of range for DateDataType', { value, month, minMonth, maxMonth });
        }

        const day = parseInt(value.slice(6, 8));
        const minDay = 1;
        const maxDay = DateDataType.daysInMonth(year, month);
        if (!(minDay <= day && day <= maxDay)) {
            throw new AdifError('day outside of range for DateDataType', { value, day, minDay, maxDay });
        }

        return true;
    }

}

export default DateDataType;
