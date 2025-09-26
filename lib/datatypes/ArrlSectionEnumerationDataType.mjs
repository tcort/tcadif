'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import ArrlSectionEnum from '../enums/ArrlSectionEnum.mjs';

const enumeration = new ArrlSectionEnum();

class ArrlSectionEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default ArrlSectionEnumerationDataType;
