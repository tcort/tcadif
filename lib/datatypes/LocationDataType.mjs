'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import ContinentEnumerationDataType from './ContinentEnumerationDataType.mjs';

class LocationDataType extends DataType {

    static get dataTypeIndicator() {
        return 'L';
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for LocationDataType', { value });
        }

        const re = /^[NSEW][0-9]{3} [0-9]{2}\.[0-9]{3}$/;
        if (!re.test(value)) {
            throw new AdifError('value does not match pattern for LocationDataType', { value, re });
        }

        const degrees = parseInt(value.slice(1,4));
        const minDegrees = 0;
        const maxDegrees = 180;
        if (!(minDegrees <= degrees && degrees <= maxDegrees)) {
            throw new AdifError('location degress out of range', { value, degrees, minDegrees, maxDegrees });
        }

        const minutes = parseInt(value.slice(5,7));
        const minMinutes = 0;
        const maxMinutes = 59;
        if (!(minMinutes <= minutes && minutes <= maxMinutes)) {
            throw new AdifError('location minutes out of range', { value, minutes, minMinutes, maxMinutes });
        }


        return true;
    }

}

export default LocationDataType;
