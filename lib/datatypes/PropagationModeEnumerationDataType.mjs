'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import PropagationModeEnum from '../enums/PropagationModeEnum.mjs';

const enumeration = new PropagationModeEnum();

class PropagationModeEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default PropagationModeEnumerationDataType;
