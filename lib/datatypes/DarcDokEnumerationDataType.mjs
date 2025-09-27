'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import DarcDokEnum from '../enums/DarcDokEnum.mjs';

const enumeration = new DarcDokEnum();

class DarcDokEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default DarcDokEnumerationDataType;
