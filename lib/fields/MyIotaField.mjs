'use strict';

import Field from './Field.mjs';
import IotaRefNoDataType from '../datatypes/IotaRefNoDataType.mjs';

class MyIotaField extends Field {

    constructor(value) {
        super(MyIotaField.fieldName, IotaRefNoDataType, value);
    }

    static get fieldName() {
        return 'MY_IOTA';
    }

}

export default MyIotaField;
