'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import GridSquareDataType from './GridSquareDataType.mjs';

class GridSquareListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for GridSquareListDataType', { value });
        }

        value.split(',').forEach(item => GridSquareDataType.validate(item));

        return true;
    }

}

export default GridSquareListDataType;
