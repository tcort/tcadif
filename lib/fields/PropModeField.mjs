'use strict';

import Field from './Field.mjs';
import PropagationModeEnumerationDataType from '../datatypes/PropagationModeEnumerationDataType.mjs';

class PropModeField extends Field {

    constructor(value) {
        super(PropModeField.fieldName, PropagationModeEnumerationDataType, value);
    }

    static get fieldName() {
        return 'PROP_MODE';
    }

}

export default PropModeField;
