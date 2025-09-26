'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class MultilineStringDataType extends DataType {

    static get dataTypeIndicator() {
        return 'M';
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for MultilineStringDataType', { value });
        }

        value = value.replace(/\r\n/g, ''); // strip \r followed immediately \n as it's allowed

        value.split('').forEach(ch => CharacterDataType.validate(ch));

        return true;
    }

}

export default MultilineStringDataType;
