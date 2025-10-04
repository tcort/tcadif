'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import SubmodeEnum from '../enums/SubmodeEnum.mjs';

const enumeration = new SubmodeEnum();

class SubmodeEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default SubmodeEnumerationDataType;
