'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class GridSquareDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'string') ? value.toUpperCase() : value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for GridSquareDataType', { value });
        }

        const re = /^[A-R]{2}([0-9]{2}([A-X]{2}([0-9]{2})?)?)?$/i;
        if (!re.test(value)) {
            throw new AdifError('Grid square does not match pattern', { value, re });
        }

        return true;
    }

}

export default GridSquareDataType;
