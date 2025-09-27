'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import AwardListDataType from './AwardListDataType.mjs';
import CreditListDataType from './CreditListDataType.mjs';

class CreditListAwardListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static getDataType(value) {
        try {
            CreditListDataType.validate(value);
            return CreditListDataType;
        } catch (err) {
            return AwardListDataType;
        }
    }

    static isImportOnly(value) {
        const dataType = CreditListAwardListDataType.getDataType(value);
        return (dataType === AwardListDataType);
    }

    static validate(value) {

        const dataType = CreditListAwardListDataType.getDataType(value);

        dataType.validate(value);

        return true;
    }

}

export default CreditListAwardListDataType;
