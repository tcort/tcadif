'use strict';

import Field from './Field.mjs';
import IotaRefNoDataType from '../datatypes/IotaRefNoDataType.mjs';

class IotaField extends Field {

    constructor(value) {
        super(IotaField.fieldName, IotaRefNoDataType, value);
    }

    static get fieldName() {
        return 'IOTA';
    }

}

export default IotaField;
