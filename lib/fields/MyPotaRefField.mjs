'use strict';

import Field from './Field.mjs';
import PotaRefListDataType from '../datatypes/PotaRefListDataType.mjs';

class MyPotaRefField extends Field {

    constructor(value) {
        super(MyPotaRefField.fieldName, PotaRefListDataType, value);
    }

    static get fieldName() {
        return 'MY_POTA_REF';
    }

}

export default MyPotaRefField;
