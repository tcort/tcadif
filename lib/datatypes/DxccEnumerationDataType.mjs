'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import DxccEnum from '../enums/DxccEnum.mjs';

const enumeration = new DxccEnum();

class DxccEnumerationDataType extends EnumerationDataType {

    static normalize(value) {
        if (typeof value === 'number') {
            value = `${value}`;
        }
        return value;
    }

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default DxccEnumerationDataType;
