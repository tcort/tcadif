'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class GridSquareExtDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'string') ? value.toUpperCase() : value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for GridSquareExtDataType', { value });
        }

        const re = /^[A-X]{2}([0-9]{2})?$/i;
        if (!re.test(value)) {
            throw new AdifError('Grid square extension does not match pattern', { value, re });
        }

        return true;
    }

}

export default GridSquareExtDataType;
