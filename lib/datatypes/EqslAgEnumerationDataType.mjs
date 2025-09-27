'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import EqslAgEnum from '../enums/EqslAgEnum.mjs';

const enumeration = new EqslAgEnum();

class EqslAgEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default EqslAgEnumerationDataType;
