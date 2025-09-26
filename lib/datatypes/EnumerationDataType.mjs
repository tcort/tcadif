'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';

class EnumerationDataType extends DataType {

    static get dataTypeIndicator() {
        return 'E';
    }

    static normalize(value) {
        return `${value}`.toUpperCase();
    }

    static isImportOnly(value, enumeration) {
        return enumeration.isImportOnly(value);
    }

    static validate(value, enumeration) {
        if (!enumeration.includes(value)) {
            throw new AdifError('value not in enumeration', { value, enumerationValues: enumeration.values });
        }
        return true;
    }

}

export default EnumerationDataType;
