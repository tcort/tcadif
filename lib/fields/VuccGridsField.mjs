'use strict';

import Field from './Field.mjs';
import GridSquareListDataType from '../datatypes/GridSquareListDataType.mjs';

class VuccGridsField extends Field {

    constructor(value) {
        super(VuccGridsField.fieldName, GridSquareListDataType, value);
    }

    static get fieldName() {
        return 'VUCC_GRIDS';
    }

}

export default VuccGridsField;
