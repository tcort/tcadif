'use strict';

import Field from './Field.mjs';
import SponsoredAwardListDataType from '../datatypes/SponsoredAwardListDataType.mjs';

class AwardSubmittedField extends Field {

    constructor(value) {
        super(AwardSubmittedField.fieldName, SponsoredAwardListDataType, value);
    }

    static get fieldName() {
        return 'AWARD_SUBMITTED';
    }

}

export default AwardSubmittedField;
