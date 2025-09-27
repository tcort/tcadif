'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import QslRcvdEnum from '../enums/QslRcvdEnum.mjs';

const enumeration = new QslRcvdEnum();

class QslRcvdEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default QslRcvdEnumerationDataType;
