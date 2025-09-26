'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class AdifVerField extends Field {

    constructor(value) {
        super(AdifVerField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'ADIF_VER';
    }

    validate(value) {
        super.validate(value);

        const re = /^3\.[0-9]\.[0-9]$/;
        if (!re.test(value)) {
            throw new AdifError('version does not match pattern', { value, re });
        }

        return true;
    }
}

export default AdifVerField;
