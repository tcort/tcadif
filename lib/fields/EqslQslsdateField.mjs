'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class EqslQslsdateField extends Field {

    constructor(value) {
        super(EqslQslsdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'EQSL_QSLSDATE';
    }

}

export default EqslQslsdateField;
