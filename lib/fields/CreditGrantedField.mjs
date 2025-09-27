'use strict';

import Field from './Field.mjs';
import CreditListAwardListDataType from '../datatypes/CreditListAwardListDataType.mjs';

class CreditGrantedField extends Field {

    constructor(value) {
        super(CreditGrantedField.fieldName, CreditListAwardListDataType, value);
    }

    static get fieldName() {
        return 'CREDIT_GRANTED';
    }

}

export default CreditGrantedField;
