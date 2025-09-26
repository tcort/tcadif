'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';

class BooleanDataType extends DataType {

    static get dataTypeIndicator() {
        return 'B';
    }

    static normalize(value) {
        if (typeof value === 'boolean') {
            value = value ? 'Y' : 'N';
        }

        // to upper case string ('Y' or 'N')
        return `${value}`.toUpperCase();
    }

    static validate(value) {
        if (!/^(Y|N)$/.test(value)) {
            throw new AdifError('value not valid for BooleanDataType', { value });
        }
        return true;
    }

}

export default BooleanDataType;
