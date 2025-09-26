'use strict';

import Field from './Field.mjs';
import SponsoredAwardListDataType from '../datatypes/SponsoredAwardListDataType.mjs';

class AwardGrantedField extends Field {

    constructor(value) {
        super(AwardGrantedField.fieldName, SponsoredAwardListDataType, value);
    }

    static get fieldName() {
        return 'AWARD_GRANTED';
    }

}

export default AwardGrantedField;
