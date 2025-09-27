'use strict';

import Field from './Field.mjs';
import CreditListAwardListDataType from '../datatypes/CreditListAwardListDataType.mjs';

class CreditSubmittedField extends Field {

    constructor(value) {
        super(CreditSubmittedField.fieldName, CreditListAwardListDataType, value);
    }

    static get fieldName() {
        return 'CREDIT_SUBMITTED';
    }

}

export default CreditSubmittedField;
