'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import AntPathEnum from '../enums/AntPathEnum.mjs';

const enumeration = new AntPathEnum();

class AntPathEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default AntPathEnumerationDataType;
