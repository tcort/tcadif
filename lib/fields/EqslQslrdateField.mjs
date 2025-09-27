'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class EqslQslrdateField extends Field {

    constructor(value) {
        super(EqslQslrdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'EQSL_QSLRDATE';
    }

}

export default EqslQslrdateField;
