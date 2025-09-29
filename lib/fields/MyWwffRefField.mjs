'use strict';

import Field from './Field.mjs';
import WwffRefDataType from '../datatypes/WwffRefDataType.mjs';

class MyWwffRefField extends Field {

    constructor(value) {
        super(MyWwffRefField.fieldName, WwffRefDataType, value);
    }

    static get fieldName() {
        return 'MY_WWFF_REF';
    }

}

export default MyWwffRefField;
