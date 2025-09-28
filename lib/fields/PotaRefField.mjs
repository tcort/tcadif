'use strict';

import Field from './Field.mjs';
import PotaRefListDataType from '../datatypes/PotaRefListDataType.mjs';

class PotaRefField extends Field {

    constructor(value) {
        super(PotaRefField.fieldName, PotaRefListDataType, value);
    }

    static get fieldName() {
        return 'POTA_REF';
    }

}

export default PotaRefField;
